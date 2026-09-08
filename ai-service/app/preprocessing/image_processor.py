import cv2
import numpy as np
import urllib.request
import io
from PIL import Image

class ImageProcessor:
    @staticmethod
    def load_image_from_url(url: str) -> np.ndarray:
        """Downloads an image from a URL or loads from local disk and returns OpenCV BGR format."""
        if url.startswith("http://") or url.startswith("https://"):
            req = urllib.request.Request(url, headers={'User-Agent': 'SadakSetu-AI-Service'})
            with urllib.request.urlopen(req) as resp:
                image_bytes = resp.read()
            image = Image.open(io.BytesIO(image_bytes))
            return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        else:
            # Local file path
            return cv2.imread(url)

    @staticmethod
    def preprocess_for_yolo(image: np.ndarray, target_size=(640, 640)):
        """Resizes with letterboxing and normalizes input for neural net."""
        h, w = image.shape[:2]
        r = min(target_size[0] / h, target_size[1] / w)
        new_unpad = (int(round(w * r)), int(round(h * r)))
        resized = cv2.resize(image, new_unpad, interpolation=cv2.INTER_LINEAR)
        return resized
