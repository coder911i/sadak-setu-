from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
import time
import uuid

from .schemas import InferenceResponse
from .dependencies import get_detector
from preprocessing.image import preprocess_image
from preprocessing.video import preprocess_video
from .inference_logger import log_inference

router = APIRouter()


@router.post("/image", response_model=InferenceResponse)
async def infer_image(file: UploadFile = File(...), detector=Depends(get_detector)):
    request_id = str(uuid.uuid4())
    start = time.time()
    try:
        image_bytes = await preprocess_image(file)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    detections = await detector.detect_image(image_bytes)
    processing_time_ms = int((time.time() - start) * 1000)
    response = InferenceResponse(
        requestId=request_id,
        modelVersion=detector.model_version,
        processingTimeMs=processing_time_ms,
        detections=detections,
    )
    await log_inference(
        request_id, detector.model_version, "image", processing_time_ms, len(detections), None
    )
    return response


@router.post("/video", response_model=InferenceResponse)
async def infer_video(file: UploadFile = File(...), detector=Depends(get_detector)):
    request_id = str(uuid.uuid4())
    start = time.time()
    try:
        video_path = await preprocess_video(file)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    detections = await detector.detect_video(video_path)
    processing_time_ms = int((time.time() - start) * 1000)
    response = InferenceResponse(
        requestId=request_id,
        modelVersion=detector.model_version,
        processingTimeMs=processing_time_ms,
        detections=detections,
    )
    await log_inference(
        request_id,
        detector.model_version,
        "video",
        processing_time_ms,
        len(detections),
        video_path,
    )
    return response
