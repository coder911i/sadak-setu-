import os
from fastapi import Depends
from .config import settings
from ..inference.yolo_detector import YOLODetector, MockDetector

# Singleton pattern: load once per process
_detector_instance = None

def get_detector():
    global _detector_instance
    if _detector_instance is None:
        if settings.AI_MODE == "live":
            _detector_instance = YOLODetector(settings)
        else:
            _detector_instance = MockDetector()
    return _detector_instance
