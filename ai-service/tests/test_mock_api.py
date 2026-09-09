import io
import os

import pytest
from fastapi.testclient import TestClient
from PIL import Image

# Ensure mock mode before app import
os.environ["AI_MODE"] = "mock"

from app.main import app  # noqa: E402
from app.schemas import InferenceResponse


@pytest.fixture()
def client():
    return TestClient(app)


def _png_bytes() -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (64, 64), color=(120, 120, 120)).save(buf, format="PNG")
    return buf.getvalue()


def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["mode"] == "mock"


def test_ready_mock(client):
    res = client.get("/ready")
    assert res.status_code == 200
    body = res.json()
    assert body["ready"] is True
    assert body["mode"] == "mock"


def test_infer_image_mock_canonical_schema(client):
    res = client.post(
        "/infer/upload/image",
        files={"file": ("road.png", _png_bytes(), "image/png")},
    )
    assert res.status_code == 200
    parsed = InferenceResponse.model_validate(res.json())
    assert parsed.status == "completed"
    assert parsed.modelVersion == "mock-0.0"
    assert parsed.detections == []
    assert parsed.processingTimeMs >= 0
    assert parsed.requestId


def test_ready_live_missing_weights(monkeypatch):
    from app.config import settings
    monkeypatch.setattr(settings, "AI_MODE", "live")
    monkeypatch.setattr(settings, "YOLO_MODEL_PATH", "non_existent_weights.pt")
    from inference.model_loader import ModelLoader
    ModelLoader._model = None
    ModelLoader._model_path = None

    client = TestClient(app)
    res = client.get("/ready")
    assert res.status_code == 503
    body = res.json()
    assert body["ready"] is False
    assert "error" in body

