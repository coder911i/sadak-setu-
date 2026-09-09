import time
from typing import List
from pathlib import Path
from app.schemas import DetectionDTO, BBox
from inference.model_loader import ModelLoader
from damage_classes import CLASS_ID_TO_NAME


class YOLODetector:
    def __init__(self, cfg):
        if cfg.AI_MODE != "live":
            raise RuntimeError("YOLODetector instantiated in non-live mode")
        self.model = ModelLoader.load_model()
        self.conf_thr = cfg.YOLO_CONF_THRESHOLD
        self.iou_thr = cfg.YOLO_IOU_THRESHOLD
        self.device = cfg.YOLO_DEVICE
        self.imgsz = cfg.YOLO_IMAGE_SIZE
        self.model.fuse()
        self.model.to(self.device)

    @property
    def model_version(self) -> str:
        return ModelLoader.get_version()

    def _normalize_bbox(self, box, img_w: int, img_h: int) -> BBox:
        x1, y1, x2, y2 = box
        return BBox(
            x1=x1 / img_w,
            y1=y1 / img_h,
            x2=x2 / img_w,
            y2=y2 / img_h,
        )

    def _parse_results(self, results) -> List[DetectionDTO]:
        detections: List[DetectionDTO] = []
        for result in results:
            img_h, img_w = result.orig_shape
            if result.boxes is None:
                continue
            for *box, conf, cls in result.boxes.data.tolist():
                class_id = int(cls)
                class_name = CLASS_ID_TO_NAME.get(class_id, f"class_{class_id}")
                detections.append(
                    DetectionDTO(
                        class_id=class_id,
                        class_name=class_name,
                        confidence=float(conf),
                        bbox=self._normalize_bbox(box, img_w, img_h),
                    )
                )
        return detections

    async def detect_image(self, image_bytes: bytes) -> List[DetectionDTO]:
        temp_path = Path("tmp")
        temp_path.mkdir(parents=True, exist_ok=True)
        img_file = temp_path / f"tmp_{int(time.time() * 1000)}.jpg"
        try:
            img_file.write_bytes(image_bytes)
            results = self.model(
                str(img_file),
                stream=False,
                conf=self.conf_thr,
                iou=self.iou_thr,
                device=self.device,
                imgsz=self.imgsz,
            )
            return self._parse_results(results)
        finally:
            img_file.unlink(missing_ok=True)

    async def detect_video(self, video_path: str) -> List[DetectionDTO]:
        results = self.model(
            video_path,
            stream=True,
            conf=self.conf_thr,
            iou=self.iou_thr,
            device=self.device,
            imgsz=self.imgsz,
        )
        all_dets: List[DetectionDTO] = []
        for frame_idx, result in enumerate(results):
            img_h, img_w = result.orig_shape
            if result.boxes is None:
                continue
            for *box, conf, cls in result.boxes.data.tolist():
                class_id = int(cls)
                class_name = CLASS_ID_TO_NAME.get(class_id, f"class_{class_id}")
                all_dets.append(
                    DetectionDTO(
                        class_id=class_id,
                        class_name=class_name,
                        confidence=float(conf),
                        bbox=self._normalize_bbox(box, img_w, img_h),
                        frame_index=frame_idx,
                    )
                )
        return all_dets
