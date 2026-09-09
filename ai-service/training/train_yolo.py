#!/usr/bin/env python3
"""Train YOLO road-damage model via Ultralytics (does not auto-run long jobs)."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from damage_classes import CLASS_ID_TO_NAME, DamageClass

DEFAULT_PROJECT = str(_ROOT / "models" / "road-damage")


def next_version_dir(project: Path, name: str) -> Path:
    """Create a non-overwriting versioned output directory."""
    base = project / name
    if not base.exists():
        return base
    n = 2
    while True:
        candidate = project / f"{name}_v{n}"
        if not candidate.exists():
            return candidate
        n += 1


def run_training(args: argparse.Namespace) -> Path:
    from ultralytics import YOLO

    data = Path(args.data)
    if not data.exists():
        raise FileNotFoundError(f"data yaml not found: {data}")

    project = Path(args.project)
    project.mkdir(parents=True, exist_ok=True)
    out_dir = next_version_dir(project, args.name)
    # Ultralytics uses project/name — pass parent + unique name
    run_name = out_dir.name
    model = YOLO(args.model)
    results = model.train(
        data=str(data),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device=args.device,
        project=str(project),
        name=run_name,
        exist_ok=False,
    )

    classes = [CLASS_ID_TO_NAME[i] for i in range(len(DamageClass))]
    meta = {
        "modelVersion": run_name,
        "datasetVersion": data.stem,
        "trainingDate": datetime.now(timezone.utc).isoformat(),
        "classes": classes,
        "trainingArguments": {
            "data": str(data.resolve()),
            "model": args.model,
            "epochs": args.epochs,
            "imgsz": args.imgsz,
            "batch": args.batch,
            "device": args.device,
            "project": str(project.resolve()),
            "name": run_name,
        },
        "saveDir": str(getattr(results, "save_dir", out_dir)),
    }
    meta_path = Path(meta["saveDir"]) / "training_metadata.json"
    meta_path.parent.mkdir(parents=True, exist_ok=True)
    meta_path.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(f"Wrote {meta_path}")
    return Path(meta["saveDir"])


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Train YOLO road-damage detector")
    parser.add_argument("--data", required=True, help="Path to dataset.yaml")
    parser.add_argument("--model", default="yolov8n.pt", help="Base model weights/config")
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--device", default="cpu")
    parser.add_argument("--project", default=DEFAULT_PROJECT)
    parser.add_argument("--name", default="exp")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate args only; do not start training",
    )
    args = parser.parse_args(argv)

    if args.dry_run:
        print("DRY_RUN OK")
        print(json.dumps(vars(args), indent=2, default=str))
        return 0

    try:
        run_training(args)
    except FileNotFoundError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
