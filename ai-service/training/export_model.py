#!/usr/bin/env python3
"""Export a trained YOLO model via Ultralytics (requires existing weights)."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

SUPPORTED_FORMATS = (
    "torchscript",
    "onnx",
    "openvino",
    "engine",
    "coreml",
    "saved_model",
    "pb",
    "tflite",
    "edgetpu",
    "tfjs",
    "paddle",
    "ncnn",
)


def export_model(model_path: Path, fmt: str, imgsz: int) -> dict:
    if not model_path.exists():
        return {
            "status": "PENDING",
            "reason": "NOT_AVAILABLE",
            "detail": f"model not found: {model_path}",
            "exportedPath": None,
        }

    from ultralytics import YOLO

    model = YOLO(str(model_path))
    exported = model.export(format=fmt, imgsz=imgsz)
    return {
        "status": "OK",
        "reason": None,
        "detail": None,
        "exportedAt": datetime.now(timezone.utc).isoformat(),
        "sourceModel": str(model_path.resolve()),
        "format": fmt,
        "imgsz": imgsz,
        "exportedPath": str(exported),
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Export trained YOLO model")
    parser.add_argument("--model", required=True, type=Path, help="Path to trained .pt")
    parser.add_argument(
        "--format",
        default="onnx",
        choices=SUPPORTED_FORMATS,
        help="Ultralytics export format",
    )
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate args only; do not export",
    )
    parser.add_argument("--output", type=Path, default=None, help="Optional JSON report")
    args = parser.parse_args(argv)

    if args.dry_run:
        payload = {
            "status": "DRY_RUN",
            "model": str(args.model),
            "format": args.format,
            "imgsz": args.imgsz,
            "modelExists": args.model.exists(),
        }
        print(json.dumps(payload, indent=2))
        return 0 if args.model.exists() else 2

    result = export_model(args.model, args.format, args.imgsz)
    text = json.dumps(result, indent=2)
    print(text)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text, encoding="utf-8")
    if result["status"] == "PENDING":
        return 2
    return 0 if result["status"] == "OK" else 1


if __name__ == "__main__":
    raise SystemExit(main())
