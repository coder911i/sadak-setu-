import uvicorn
from fastapi import FastAPI
from .router import router
from .health import router as health_router
from .config import settings

app = FastAPI(
    title="Sadak Setu AI Service",
    version="0.1.0"
)
app.include_router(router, prefix='/infer')
app.include_router(health_router)

if __name__ == '__main__':
    uvicorn.run('app.main:app', host='0.0.0.0', port=8000, reload=True)
