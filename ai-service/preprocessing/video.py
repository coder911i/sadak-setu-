import os
import shutil
import uuid
from pathlib import Path
import cv2
from fastapi import UploadFile, HTTPException

MAX_VIDEO_SIZE_MB = int(os.getenv('MAX_VIDEO_SIZE_MB', '100'))
ALLOWED_VIDEO_MIME_TYPES = {'video/mp4', 'video/avi', 'video/mov', 'video/webm'}

async def preprocess_video(file: UploadFile) -> str:
    # Validate MIME type
    if file.content_type not in ALLOWED_VIDEO_MIME_TYPES:
        raise HTTPException(status_code=400, detail='Unsupported video type')
    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > MAX_VIDEO_SIZE_MB:
        raise HTTPException(status_code=400, detail='Video file too large')
    # Save to temporary location
    tmp_dir = Path('ai-service/tmp')
    tmp_dir.mkdir(parents=True, exist_ok=True)
    video_path = tmp_dir / f"tmp_{uuid.uuid4().hex}.mp4"
    video_path.write_bytes(content)
    # Simple sanity check: can OpenCV open it?
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        # Cleanup
        video_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail='Cannot read video file')
    cap.release()
    return str(video_path)
