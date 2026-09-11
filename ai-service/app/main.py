import uvicorn
from fastapi import FastAPI
from .router import router as upload_router
from .health import router as health_router
from .api.infer import router as infer_router
from .api.verify import router as verify_router
from .api.sensor import router as sensor_router
from .config import settings

app = FastAPI(
    title="Sadak Setu AI Service",
    version="0.1.0"
)
# File-upload YOLO routes (for direct media ingestion)
app.include_router(upload_router, prefix='/infer/upload')
# JSON-body inference routes (for backend microservice calls)
app.include_router(infer_router, prefix='/infer')
# Sensor-based inference routes (for IoT telemetry)
app.include_router(sensor_router, prefix='/sensor')
# Before/After verification route
app.include_router(verify_router, prefix='/verify')
app.include_router(health_router)

if __name__ == '__main__':
    uvicorn.run('app.main:app', host='0.0.0.0', port=8000, reload=True)
