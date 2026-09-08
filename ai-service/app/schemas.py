from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class BBox(BaseModel):
    x1: float = Field(..., description="Top‑left x coordinate (relative 0‑1)")
    y1: float = Field(..., description="Top‑left y coordinate (relative 0‑1)")
    x2: float = Field(..., description="Bottom‑right x coordinate (relative 0‑1)")
    y2: float = Field(..., description="Bottom‑right y coordinate (relative 0‑1)")

class DetectionDTO(BaseModel):
    class_id: int = Field(..., description="Numeric class identifier")
    class_name: str = Field(..., description="Human readable class name")
    confidence: float = Field(..., ge=0.0, le=1.0)
    bbox: BBox
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    frame_index: Optional[int] = None

class InferenceResponse(BaseModel):
    requestId: str
    modelVersion: str
    processingTimeMs: int
    detections: List[DetectionDTO]
    status: Literal["completed"] = "completed"
