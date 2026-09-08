from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class DamageTypeEnum(str, Enum):
    POTHOLE = "POTHOLE"
    CRACK = "CRACK"
    SURFACE_DAMAGE = "SURFACE_DAMAGE"
    EDGE_DAMAGE = "EDGE_DAMAGE"

class DamageSeverityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class VerificationStatusEnum(str, Enum):
    VERIFIED = "VERIFIED"
    NOT_VERIFIED = "NOT_VERIFIED"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"

class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float

class GeoLocation(BaseModel):
    latitude: float
    longitude: float

class DetectionItem(BaseModel):
    damageType: DamageTypeEnum
    confidence: float = Field(..., ge=0.0, le=1.0)
    severity: DamageSeverityEnum
    boundingBox: BoundingBox
    location: Optional[GeoLocation] = None
    chainage: Optional[float] = None

class ImageInferRequest(BaseModel):
    mediaUrl: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    chainage: Optional[float] = None

class VideoInferRequest(BaseModel):
    mediaUrl: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AnalysisResponse(BaseModel):
    analysisId: str
    source: str = "LIVE_YOLO_V8"
    mediaUrl: str
    inferenceTimeMs: float
    detections: List[DetectionItem]
    metadata: Optional[Dict[str, Any]] = None

class VerificationRequest(BaseModel):
    beforeMediaUrl: str
    afterMediaUrl: str

class VerificationResponse(BaseModel):
    verificationId: str
    result: VerificationStatusEnum
    confidence: float
    reason: str
    visualSimilarity: float
    defectReduction: float
    analysisTimeMs: float
