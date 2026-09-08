import os
from pydantic import BaseSettings, Field, validator

class Settings(BaseSettings):
    AI_MODE: str = Field('mock', env='AI_MODE')
    YOLO_MODEL_PATH: str = Field('', env='YOLO_MODEL_PATH')
    YOLO_DEVICE: str = Field('cpu', env='YOLO_DEVICE')
    YOLO_CONF_THRESHOLD: float = Field(0.25, env='YOLO_CONF_THRESHOLD')
    YOLO_IOU_THRESHOLD: float = Field(0.45, env='YOLO_IOU_THRESHOLD')
    YOLO_IMAGE_SIZE: int = Field(640, env='YOLO_IMAGE_SIZE')

    @validator('AI_MODE')
    def mode_must_be_mock_or_live(cls, v):
        if v not in {'mock', 'live'}:
            raise ValueError('AI_MODE must be "mock" or "live"')
        return v

    class Config:
        env_file = '.env'
        case_sensitive = False

settings = Settings()
