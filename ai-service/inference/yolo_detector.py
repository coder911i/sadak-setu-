import time
from typing import List
from pathlib import Path
from ultralytics import YOLO
from pydantic import BaseModel

from ..config import settings
from .model_loader import ModelLoader
from ..damage_classes import CLASS_ID_TO_NAME

class DetectionDTO(BaseModel):
    class_id: int
    class_name: str
    confidence: float
    bbox: dict
    latitude: float | None = None
    longitude: float | None = None
    frame_index: int | None = None

class YOLODetector:
    def __init__(self, cfg):
        if cfg.AI_MODE != "live":
            raise RuntimeError("YOLODetector instantiated in non‑live mode")
        # Load once via ModelLoader
        self.model = ModelLoader.load_model()
        self.conf_thr = cfg.YOLO_CONF_THRESHOLD
        self.iou_thr = cfg.YOLO_IOU_THRESHOLD
        self.device = cfg.YOLO_DEVICE
        self.model.fuse()  # optional speed‑up
        self.model.to(self.device)
        self.model.conf = self.conf_thr
        self.model.iou = self.iou_thr

    @property
    def model_version(self) -> str:
        return ModelLoader.get_version()

    def _normalize_bbox(self, box, img_w: int, img_h: int) -> dict:
        # Ultralytics returns (x1, y1, x2, y2) in absolute pixels
        x1, y1, x2, y2 = box
        return {
            "x1": x1 / img_w,
            "y1": y1 / img_h,
            "x2": x2 / img_w,
            "y2": y2 / img_h,
        }

    def _parse_results(self, results) -> List[DetectionDTO]:
        detections: List[DetectionDTO] = []
        for result in results:
            img_w, img_h = result.orig_shape[1], result.orig_shape[0]
            for *box, conf, cls in result.boxes.data.tolist():
                class_id = int(cls)
                class_name = CLASS_ID_TO_NAME.get(class_id, f"class_{class_id}")
                bbox = self._normalize_bbox(box, img_w, img_h)
                detections.append(
                    DetectionDTO(
                        class_id=class_id,
                        class_name=class_name,
                        confidence=conf,
                        bbox=bbox,
                    )
                )
        return detections

    async def detect_image(self, image_bytes: bytes) -> List[DetectionDTO]:
        # Write to temp file because YOLO expects a path
        temp_path = Path("ai-service/tmp")
        temp_path.mkdir(parents=True, exist_ok=True)
        img_file = temp_path / f"tmp_{int(time.time()*1000)}.jpg"
        img_file.write_bytes(image_bytes)
        results = self.model(img_file, stream=False)
        detections = self._parse_results(results)
        img_file.unlink(missing_ok=True)
        return detections

    async def detect_video(self, video_path: str) -> List[DetectionDTO]:
        # Simple per‑frame inference; grouping is done elsewhere
        results = self.model(video_path, stream=True)
        all_dets: List[DetectionDTO] = []
        for frame_idx, result in enumerate(results):
            img_w, img_h = result.orig_shape[1], result.orig_shape[0]
            for *box, conf, cls in result.boxes.data.tolist():
                class_id = int(cls)
                class_name = CLASS_ID_TO_NAME.get(class_id, f"class_{class_id}")
                bbox = self._normalize_bbox(box, img_w, img_h)
                all_dets.append(
                    DetectionDTO(
                        class_id=class_id,
                        class_name=class_name,
                        confidence=conf,
                        bbox=bbox,
                        frame_index=frame_idx,
                    )
                )
        return all_dets
