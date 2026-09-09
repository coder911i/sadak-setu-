#!/usr/bin/env python3
"""Validate a YOLO-format road-damage dataset and write dataset_report.json."""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

# Allow running as script from repo / ai-service root
_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from damage_classes import CLASS_ID_TO_NAME, DamageClass

DEFAULT_CLASS_COUNT = len(DamageClass)
SPLITS = ("train", "val", "test")


def discover_split_dirs(dataset: Path) -> dict[str, tuple[Path, Path]]:
    """Return {split: (images_dir, labels_dir)} for present splits."""
    found: dict[str, tuple[Path, Path]] = {}
    for split in SPLITS:
        img = dataset / "images" / split
        lbl = dataset / "labels" / split
        if img.is_dir() or lbl.is_dir():
            found[split] = (img, lbl)
        else:
            # alternate: dataset/train/images + dataset/train/labels
            alt_img = dataset / split / "images"
            alt_lbl = dataset / split / "labels"
            if alt_img.is_dir() or alt_lbl.is_dir():
                found[split] = (alt_img, alt_lbl)
    return found


def _stem_map(directory: Path, suffixes: set[str]) -> dict[str, Path]:
    if not directory.is_dir():
        return {}
    out: dict[str, Path] = {}
    for p in directory.iterdir():
        if p.is_file() and p.suffix.lower() in suffixes:
            out[p.stem] = p
    return out


IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tif", ".tiff"}


def validate_label_line(
    line: str, class_count: int, line_no: int
) -> tuple[int | None, str | None]:
    parts = line.split()
    if len(parts) != 5:
        return None, f"line {line_no}: expected 5 tokens, got {len(parts)}"
    try:
        cls = int(float(parts[0]))
        xc, yc, w, h = (float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4]))
    except ValueError:
        return None, f"line {line_no}: non-numeric values"
    if cls < 0 or cls >= class_count:
        return None, f"line {line_no}: class id {cls} out of range [0,{class_count})"
    for name, val in (("xc", xc), ("yc", yc), ("w", w), ("h", h)):
        if not (0.0 <= val <= 1.0):
            return None, f"line {line_no}: {name}={val} not in [0,1]"
    if w <= 0.0 or h <= 0.0:
        return None, f"line {line_no}: bbox width/height must be > 0"
    return cls, None


def validate_dataset(dataset: Path, class_count: int = DEFAULT_CLASS_COUNT) -> dict:
    dataset = dataset.resolve()
    splits = discover_split_dirs(dataset)
    invalid: list[dict] = []
    class_dist: Counter[int] = Counter()
    split_counts = {s: {"images": 0, "labels": 0} for s in SPLITS}
    image_count = 0
    label_count = 0

    if not splits:
        invalid.append(
            {
                "path": str(dataset),
                "reason": "no YOLO split directories found (images/{train,val,test})",
            }
        )

    for split, (img_dir, lbl_dir) in splits.items():
        images = _stem_map(img_dir, IMAGE_SUFFIXES)
        labels = _stem_map(lbl_dir, {".txt"})
        split_counts[split]["images"] = len(images)
        split_counts[split]["labels"] = len(labels)
        image_count += len(images)
        label_count += len(labels)

        for stem, img_path in sorted(images.items()):
            lbl_path = labels.get(stem)
            if lbl_path is None:
                invalid.append(
                    {"path": str(img_path), "reason": "missing matching label"}
                )
                continue
            try:
                with Image.open(img_path) as im:
                    im.verify()
            except Exception as e:  # noqa: BLE001 — report unreadable images
                invalid.append(
                    {"path": str(img_path), "reason": f"unreadable image: {e}"}
                )
                continue

            try:
                text = lbl_path.read_text(encoding="utf-8")
            except Exception as e:  # noqa: BLE001
                invalid.append(
                    {"path": str(lbl_path), "reason": f"unreadable label: {e}"}
                )
                continue

            lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
            if not lines:
                # empty label file is allowed (background image) but recorded
                continue
            for i, line in enumerate(lines, start=1):
                cls, err = validate_label_line(line, class_count, i)
                if err:
                    invalid.append({"path": str(lbl_path), "reason": err})
                else:
                    assert cls is not None
                    class_dist[cls] += 1

        for stem, lbl_path in sorted(labels.items()):
            if stem not in images:
                invalid.append(
                    {"path": str(lbl_path), "reason": "missing matching image"}
                )

    classes = [CLASS_ID_TO_NAME[i] for i in range(class_count) if i in CLASS_ID_TO_NAME]
    # pad names for custom class_count beyond canonical map
    while len(classes) < class_count:
        classes.append(f"class_{len(classes)}")

    report = {
        "datasetVersion": dataset.name,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "datasetPath": str(dataset),
        "imageCount": image_count,
        "labelCount": label_count,
        "splitCounts": split_counts,
        "classDistribution": {
            classes[i] if i < len(classes) else f"class_{i}": class_dist.get(i, 0)
            for i in range(class_count)
        },
        "invalidSamples": invalid,
        "classes": classes,
        "valid": len(invalid) == 0 and image_count > 0,
    }
    return report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate YOLO road-damage dataset")
    parser.add_argument("--dataset", required=True, type=Path, help="Dataset root path")
    parser.add_argument(
        "--class-count",
        type=int,
        default=DEFAULT_CLASS_COUNT,
        help=f"Number of classes (default {DEFAULT_CLASS_COUNT})",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Output report path (default: <dataset>/dataset_report.json)",
    )
    args = parser.parse_args(argv)

    if not args.dataset.exists():
        print(f"ERROR: dataset path does not exist: {args.dataset}", file=sys.stderr)
        return 2

    report = validate_dataset(args.dataset, class_count=args.class_count)
    out = args.output or (args.dataset / "dataset_report.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Wrote {out}")
    print(
        f"images={report['imageCount']} labels={report['labelCount']} "
        f"invalid={len(report['invalidSamples'])} valid={report['valid']}"
    )
    return 0 if report["valid"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
