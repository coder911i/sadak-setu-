from fastapi import APIRouter
from fastapi.responses import JSONResponse
from .config import settings

router = APIRouter()


@router.get("/health")
def health():
    return JSONResponse(content={"status": "ok", "mode": settings.AI_MODE})


@router.get("/ready")
def readiness():
    if settings.AI_MODE == "live":
        from inference.model_loader import ModelLoader

        try:
            ModelLoader.load_model()
            return JSONResponse(
                content={"ready": True, "modelVersion": ModelLoader.get_version()}
            )
        except FileNotFoundError as e:
            return JSONResponse(status_code=503, content={"ready": False, "error": str(e)})
    return JSONResponse(content={"ready": True, "mode": "mock"})
