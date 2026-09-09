"""Pytest coverage for YOLO dataset validator."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

from training.validate_dataset import validate_dataset


def _write_image(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.new("RGB", (32, 32), color=(80, 80, 80)).save(path)


def _yolo_layout(root: Path) -> None:
    for split in ("train", "val", "test"):
        (root / "images" / split).mkdir(parents=True, exist_ok=True)
        (root / "labels" / split).mkdir(parents=True, exist_ok=True)


def test_valid_dataset(tmp_path: Path):
    root = tmp_path / "ds"
    _yolo_layout(root)
    _write_image(root / "images" / "train" / "a.jpg")
    (root / "labels" / "train" / "a.txt").write_text("0 0.5 0.5 0.2 0.2\n", encoding="utf-8")
    _write_image(root / "images" / "val" / "b.jpg")
    (root / "labels" / "val" / "b.txt").write_text("1 0.4 0.4 0.1 0.1\n", encoding="utf-8")

    report = validate_dataset(root)
    assert report["valid"] is True
    assert report["imageCount"] == 2
    assert report["labelCount"] == 2
    assert report["classDistribution"]["POTHOLE"] == 1
    assert report["classDistribution"]["CRACK"] == 1
    assert report["invalidSamples"] == []
    assert "POTHOLE" in report["classes"]


def test_invalid_class(tmp_path: Path):
    root = tmp_path / "ds"
    _yolo_layout(root)
    _write_image(root / "images" / "train" / "a.jpg")
    (root / "labels" / "train" / "a.txt").write_text("99 0.5 0.5 0.2 0.2\n", encoding="utf-8")

    report = validate_dataset(root)
    assert report["valid"] is False
    assert any("class id 99" in i["reason"] for i in report["invalidSamples"])


def test_invalid_bbox(tmp_path: Path):
    root = tmp_path / "ds"
    _yolo_layout(root)
    _write_image(root / "images" / "train" / "a.jpg")
    (root / "labels" / "train" / "a.txt").write_text("0 0.5 0.5 0.0 0.2\n", encoding="utf-8")

    report = validate_dataset(root)
    assert report["valid"] is False
    assert any("width/height" in i["reason"] for i in report["invalidSamples"])


def test_missing_label(tmp_path: Path):
    root = tmp_path / "ds"
    _yolo_layout(root)
    _write_image(root / "images" / "train" / "a.jpg")

    report = validate_dataset(root)
    assert report["valid"] is False
    assert any("missing matching label" in i["reason"] for i in report["invalidSamples"])


def test_malformed_label(tmp_path: Path):
    root = tmp_path / "ds"
    _yolo_layout(root)
    _write_image(root / "images" / "train" / "a.jpg")
    (root / "labels" / "train" / "a.txt").write_text("not-a-label\n", encoding="utf-8")

    report = validate_dataset(root)
    assert report["valid"] is False
    assert any(
        "expected 5 tokens" in i["reason"] or "non-numeric" in i["reason"]
        for i in report["invalidSamples"]
    )


def test_cli_writes_report(tmp_path: Path):
    from training.validate_dataset import main

    root = tmp_path / "ds"
    _yolo_layout(root)
    _write_image(root / "images" / "train" / "a.jpg")
    (root / "labels" / "train" / "a.txt").write_text("0 0.5 0.5 0.2 0.2\n", encoding="utf-8")
    out = tmp_path / "dataset_report.json"
    rc = main(["--dataset", str(root), "--output", str(out)])
    assert rc == 0
    data = json.loads(out.read_text(encoding="utf-8"))
    assert data["imageCount"] == 1
    assert data["valid"] is True
