"""
JSON-body inference endpoints.
Routes through the same detector singleton as the file-upload router so that
AI_MODE=live uses the real YOLODetector and AI_MODE=mock uses MockDetector.
Source label reflects actual engine used; never claims LIVE when running mock/heuristic.
"""
from fastapi import APIRouter, HTTPException, Depends
import time
import uuid

from app.models.schemas import (
    ImageInferRequest,
    VideoInferRequest,
    AnalysisResponse,
    DetectionItem,
    DamageTypeEnum,
    DamageSeverityEnum,
    BoundingBox,
    GeoLocation,
)
from app.dependencies import get_detector
from app.config import settings

router = APIRouter()

# Severity mapping from class name (heuristic/mock path)
_SEVERITY_MAP = {
    "POTHOLE": DamageSeverityEnum.HIGH,
    "CRACK": DamageSeverityEnum.MEDIUM,
    "SURFACE_DAMAGE": DamageSeverityEnum.LOW,
    "EDGE_DAMAGE": DamageSeverityEnum.LOW,
}

_DAMAGE_TYPE_MAP = {
    "POTHOLE": DamageTypeEnum.POTHOLE,
    "CRACK": DamageTypeEnum.CRACK,
    "SURFACE_DAMAGE": DamageTypeEnum.SURFACE_DAMAGE,
    "EDGE_DAMAGE": DamageTypeEnum.EDGE_DAMAGE,
}


from models.severity_classifier import default_severity_classifier

def _dto_to_detection_item(dto, lat=None, lon=None, chainage=None) -> DetectionItem:
    """Convert a DetectionDTO (from inference layer) to a DetectionItem (API response)."""
    damage_type = _DAMAGE_TYPE_MAP.get(dto.class_name.upper(), DamageTypeEnum.SURFACE_DAMAGE)
    # bbox: DTO uses normalized [0-1] x1/y1/x2/y2; convert to x/y/width/height (still normalized)
    bw = dto.bbox.x2 - dto.bbox.x1
    bh = dto.bbox.y2 - dto.bbox.y1
    severity = default_severity_classifier.classify_severity(dto.class_name, bw * bh, dto.confidence)
    return DetectionItem(
        damageType=damage_type,
        confidence=dto.confidence,
        severity=severity,
        boundingBox=BoundingBox(x=dto.bbox.x1, y=dto.bbox.y1, width=bw, height=bh),
        location=GeoLocation(latitude=lat, longitude=lon) if lat and lon else None,
        chainage=chainage,
    )


@router.post("/image", response_model=AnalysisResponse)
async def infer_image(payload: ImageInferRequest, detector=Depends(get_detector)):
    start = time.time()
    try:
        # Fetch image bytes from URL for real inference; use empty bytes for mock
        image_bytes: bytes = b""
        if settings.AI_MODE == "live":
            import urllib.request
            try:
                with urllib.request.urlopen(payload.mediaUrl, timeout=15) as resp:
                    image_bytes = resp.read()
            except Exception as e:
                raise HTTPException(status_code=422, detail=f"Cannot fetch mediaUrl: {e}")

        dtos = await detector.detect_image(image_bytes)
        duration = (time.time() - start) * 1000

        detections = [
            _dto_to_detection_item(d, payload.latitude, payload.longitude, payload.chainage)
            for d in dtos
        ]

        return AnalysisResponse(
            analysisId=str(uuid.uuid4()),
            source=detector.model_version,   # reflects actual engine (real model stem or "mock-0.0")
            mediaUrl=payload.mediaUrl,
            inferenceTimeMs=round(duration, 2),
            detections=detections,
            metadata={"ai_mode": settings.AI_MODE, "model": detector.model_version},
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@router.post("/video", response_model=AnalysisResponse)
async def infer_video(payload: VideoInferRequest, detector=Depends(get_detector)):
    start = time.time()
    try:
        dtos = await detector.detect_video(str(payload.mediaUrl))
        duration = (time.time() - start) * 1000

        detections = [
            _dto_to_detection_item(d, payload.latitude, payload.longitude)
            for d in dtos
        ]

        return AnalysisResponse(
            analysisId=str(uuid.uuid4()),
            source=detector.model_version,
            mediaUrl=str(payload.mediaUrl),
            inferenceTimeMs=round(duration, 2),
            detections=detections,
            metadata={"ai_mode": settings.AI_MODE, "model": detector.model_version},
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video inference error: {str(e)}")
