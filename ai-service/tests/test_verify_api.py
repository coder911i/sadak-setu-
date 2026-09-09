import os
import pytest
from fastapi.testclient import TestClient

os.environ["AI_MODE"] = "mock"

from app.main import app  # noqa: E402
from app.models.schemas import VerificationStatusEnum


@pytest.fixture()
def client():
    return TestClient(app)


# ── /verify/before-after ─────────────────────────────────────────────────────

def test_verify_before_after_verified(client):
    res = client.post(
        "/verify/before-after",
        json={
            "beforeMediaUrl": "https://cdn.sadaksetu.in/before/pothole_nh48_km12.jpg",
            "afterMediaUrl": "https://cdn.sadaksetu.in/after/repair_complete.jpg",
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["result"] == VerificationStatusEnum.VERIFIED
    assert body["confidence"] >= 0.85
    assert body["defectReduction"] > 90
    assert body["verificationId"]


def test_verify_before_after_not_verified(client):
    res = client.post(
        "/verify/before-after",
        json={
            "beforeMediaUrl": "https://cdn.sadaksetu.in/before/pothole_nh48_km12.jpg",
            "afterMediaUrl": "https://cdn.sadaksetu.in/after/repair_fail_incomplete.jpg",
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["result"] == VerificationStatusEnum.NOT_VERIFIED
    assert body["confidence"] >= 0.5


def test_verify_before_after_review_required(client):
    res = client.post(
        "/verify/before-after",
        json={
            "beforeMediaUrl": "https://cdn.sadaksetu.in/before/pothole_nh48_km12.jpg",
            "afterMediaUrl": "https://cdn.sadaksetu.in/after/repair_review_pending.jpg",
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["result"] == VerificationStatusEnum.REVIEW_REQUIRED


def test_verify_missing_fields(client):
    res = client.post("/verify/before-after", json={"beforeMediaUrl": "x"})
    assert res.status_code == 422  # Validation error


# ── /infer/image (JSON-body) ─────────────────────────────────────────────────

def test_infer_image_json(client):
    res = client.post(
        "/infer/image",
        json={
            "mediaUrl": "https://cdn.sadaksetu.in/inspections/frame_001.jpg",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "chainage": 142.5,
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["analysisId"]
    assert body["mediaUrl"] == "https://cdn.sadaksetu.in/inspections/frame_001.jpg"
    assert isinstance(body["detections"], list)
    assert body["inferenceTimeMs"] >= 0


def test_infer_image_without_gps(client):
    res = client.post(
        "/infer/image",
        json={"mediaUrl": "https://cdn.sadaksetu.in/inspections/frame_002.jpg"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["source"] == "LIVE_YOLO_V8"
