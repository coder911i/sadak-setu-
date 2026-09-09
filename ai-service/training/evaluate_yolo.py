#!/usr/bin/env python3
"""Evaluate a trained YOLO model; never fabricate metrics."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))


def evaluate(model_path: Path, data_path: Path, device: str) -> dict:
    if not model_path.exists():
        return {
            "status": "PENDING",
            "reason": "NOT_AVAILABLE",
            "detail": f"model not found: {model_path}",
            "precision": None,
            "recall": None,
            "mAP50": None,
            "mAP50-95": None,
        }
    if not data_path.exists():
        return {
            "status": "PENDING",
            "reason": "NOT_AVAILABLE",
            "detail": f"dataset yaml not found: {data_path}",
            "precision": None,
            "recall": None,
            "mAP50": None,
            "mAP50-95": None,
        }

    from ultralytics import YOLO

    model = YOLO(str(model_path))
    metrics = model.val(data=str(data_path), device=device)
    box = getattr(metrics, "box", None)
    if box is None:
        return {
            "status": "ERROR",
            "reason": "NO_BOX_METRICS",
            "detail": "Ultralytics validation returned no box metrics",
            "precision": None,
            "recall": None,
            "mAP50": None,
            "mAP50-95": None,
        }

    return {
        "status": "OK",
        "reason": None,
        "detail": None,
        "evaluatedAt": datetime.now(timezone.utc).isoformat(),
        "model": str(model_path.resolve()),
        "data": str(data_path.resolve()),
        "device": device,
        "precision": float(box.mp),
        "recall": float(box.mr),
        "mAP50": float(box.map50),
        "mAP50-95": float(box.map),
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Evaluate YOLO road-damage model")
    parser.add_argument("--model", required=True, type=Path, help="Path to .pt weights")
    parser.add_argument("--data", required=True, type=Path, help="Path to dataset.yaml")
    parser.add_argument("--device", default="cpu")
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Optional metrics JSON output path",
    )
    args = parser.parse_args(argv)

    result = evaluate(args.model, args.data, args.device)
    text = json.dumps(result, indent=2)
    print(text)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text, encoding="utf-8")

    if result["status"] == "PENDING":
        return 2
    if result["status"] != "OK":
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
