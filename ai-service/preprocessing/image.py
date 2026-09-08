import os
from fastapi import UploadFile, HTTPException
from typing import Tuple
from PIL import Image
import io

MAX_IMAGE_SIZE_MB = int(os.getenv('MAX_IMAGE_SIZE_MB', '10'))
ALLOWED_MIME_TYPES = {'image/jpeg', 'image/png', 'image/webp'}

async def preprocess_image(file: UploadFile) -> bytes:
    # Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail='Unsupported image type')
    # Read content
    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > MAX_IMAGE_SIZE_MB:
        raise HTTPException(status_code=400, detail='Image file too large')
    # Verify image can be opened
    try:
        Image.open(io.BytesIO(content)).verify()
    except Exception:
        raise HTTPException(status_code=400, detail='Corrupt image file')
    return content
