import os


class Settings:
    """Environment-backed settings for the AI microservice."""

    def __init__(self) -> None:
        mode = os.getenv("AI_MODE", "mock").strip().lower()
        if mode not in {"mock", "live"}:
            raise ValueError('AI_MODE must be "mock" or "live"')
        self.AI_MODE: str = mode
        self.YOLO_MODEL_PATH: str = os.getenv("YOLO_MODEL_PATH", "").strip()
        self.YOLO_DEVICE: str = os.getenv("YOLO_DEVICE", "cpu").strip() or "cpu"
        self.YOLO_CONF_THRESHOLD: float = float(os.getenv("YOLO_CONF_THRESHOLD", "0.25"))
        self.YOLO_IOU_THRESHOLD: float = float(os.getenv("YOLO_IOU_THRESHOLD", "0.45"))
        self.YOLO_IMAGE_SIZE: int = int(os.getenv("YOLO_IMAGE_SIZE", "640"))


settings = Settings()
