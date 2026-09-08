import os
from pathlib import Path
from ultralytics import YOLO
from ..config import settings

class ModelLoader:
    _model = None
    _model_path = None

    @classmethod
    def load_model(cls):
        if cls._model is not None:
            return cls._model
        model_path = settings.YOLO_MODEL_PATH
        if not model_path:
            raise FileNotFoundError('YOLO_MODEL_PATH is not configured')
        if not Path(model_path).exists():
            raise FileNotFoundError(f'YOLO model file not found at {model_path}')
        # Load with Ultralytics YOLO class
        cls._model = YOLO(model_path)
        cls._model_path = model_path
        return cls._model

    @classmethod
    def get_version(cls):
        if cls._model_path:
            return Path(cls._model_path).stem
        return 'unknown'
