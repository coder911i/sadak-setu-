from typing import List
from ..schemas import DetectionDTO

class MockDetector:
    def __init__(self):
        self.model_version = "mock-0.0"

    async def detect_image(self, image_bytes: bytes) -> List[DetectionDTO]:
        # Return empty list for mock mode
        return []

    async def detect_video(self, video_path: str) -> List[DetectionDTO]:
        return []
