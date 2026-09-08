from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
import time
import uuid

from ..app.schemas import InferenceResponse, DetectionDTO
from ..app.dependencies import get_detector
from ..preprocessing.image_preprocessor import preprocess_image
from ..preprocessing.video_preprocessor import preprocess_video
from ..logging.inference_logger import log_inference

router = APIRouter()

@router.post("/image", response_model=InferenceResponse)
async def infer_image(file: UploadFile = File(...), detector = Depends(get_detector)):
    request_id = str(uuid.uuid4())
    start = time.time()
    try:
        image_bytes = await preprocess_image(file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    detections = await detector.detect_image(image_bytes)
    processing_time_ms = int((time.time() - start) * 1000)
    response = InferenceResponse(
        requestId=request_id,
        modelVersion=detector.model_version,
        processingTimeMs=processing_time_ms,
        detections=detections,
    )
    await log_inference(request_id, detector.model_version, "image", processing_time_ms, len(detections), None)
    return response

@router.post("/video", response_model=InferenceResponse)
async def infer_video(file: UploadFile = File(...), detector = Depends(get_detector)):
    request_id = str(uuid.uuid4())
    start = time.time()
    try:
        video_path = await preprocess_video(file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    detections = await detector.detect_video(video_path)
    processing_time_ms = int((time.time() - start) * 1000)
    response = InferenceResponse(
        requestId=request_id,
        modelVersion=detector.model_version,
        processingTimeMs=processing_time_ms,
        detections=detections,
    )
    await log_inference(request_id, detector.model_version, "video", processing_time_ms, len(detections), video_path)
    return response
