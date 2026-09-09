#!/usr/bin/env python3
"""Prepare a YOLO dataset: write dataset.yaml + manifest.json (no downloads)."""

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
from training.validate_dataset import (
    IMAGE_SUFFIXES,
    _stem_map,
    discover_split_dirs,
    validate_dataset,
)

CANONICAL_CLASSES = [CLASS_ID_TO_NAME[i] for i in range(len(DamageClass))]


def parse_class_map(raw: str | None) -> dict[str, int]:
    """Parse 'SRC=0,OTHER=1' or JSON object mapping source name -> canonical id."""
    if not raw:
        return {name: i for i, name in enumerate(CANONICAL_CLASSES)}
    raw = raw.strip()
    if raw.startswith("{"):
        data = json.loads(raw)
        return {str(k): int(v) for k, v in data.items()}
    mapping: dict[str, int] = {}
    for part in raw.split(","):
        part = part.strip()
        if not part:
            continue
        if "=" not in part:
            raise ValueError(f"Invalid class map entry: {part}")
        src, dst = part.split("=", 1)
        mapping[src.strip()] = int(dst.strip())
    return mapping


def prepare_dataset(
    source: Path,
    output: Path,
    class_map: dict[str, int] | None = None,
) -> dict:
    source = source.resolve()
    output = output.resolve()
    output.mkdir(parents=True, exist_ok=True)

    report = validate_dataset(source, class_count=len(DamageClass))
    splits = discover_split_dirs(source)

    # Resolve absolute paths for yaml (Ultralytics prefers absolute or relative to yaml)
    yaml_paths: dict[str, str] = {}
    for split, (img_dir, _lbl) in splits.items():
        if img_dir.is_dir():
            yaml_paths[split] = str(img_dir.resolve())

    names = CANONICAL_CLASSES
    yaml_lines = [f"path: {source.as_posix()}", f"nc: {len(names)}"]
    for split in ("train", "val", "test"):
        if split in yaml_paths:
            # relative to path: images/<split> when standard layout
            rel = Path(yaml_paths[split])
            try:
                rel_s = rel.relative_to(source).as_posix()
            except ValueError:
                rel_s = rel.as_posix()
            yaml_lines.append(f"{split}: {rel_s}")
    yaml_lines.append("names:")
    for i, name in enumerate(names):
        yaml_lines.append(f"  {i}: {name}")

    dataset_yaml = output / "dataset.yaml"
    dataset_yaml.write_text("\n".join(yaml_lines) + "\n", encoding="utf-8")

    mapping = class_map or {name: i for i, name in enumerate(names)}
    file_entries: list[dict] = []
    for split, (img_dir, lbl_dir) in splits.items():
        images = _stem_map(img_dir, IMAGE_SUFFIXES)
        labels = _stem_map(lbl_dir, {".txt"})
        for stem, img_path in sorted(images.items()):
            entry = {
                "split": split,
                "image": str(img_path.resolve()),
                "label": str(labels[stem].resolve()) if stem in labels else None,
            }
            file_entries.append(entry)

    manifest = {
        "datasetVersion": source.name,
        "preparedAt": datetime.now(timezone.utc).isoformat(),
        "source": str(source),
        "output": str(output),
        "datasetYaml": str(dataset_yaml),
        "classes": names,
        "classMapping": mapping,
        "imageCount": report["imageCount"],
        "labelCount": report["labelCount"],
        "splitCounts": report["splitCounts"],
        "invalidSamples": report["invalidSamples"],
        "files": file_entries,
        "notes": "Labels are not invented; missing labels remain null in manifest.",
    }
    manifest_path = output / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    # Also copy validation report next to outputs
    (output / "dataset_report.json").write_text(
        json.dumps(report, indent=2), encoding="utf-8"
    )
    return manifest


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Prepare YOLO dataset.yaml and manifest.json (no downloads)"
    )
    parser.add_argument("--source", required=True, type=Path, help="Source dataset root")
    parser.add_argument("--output", required=True, type=Path, help="Output directory")
    parser.add_argument(
        "--class-map",
        default=None,
        help="Optional mapping SRC=0,OTHER=1 or JSON object",
    )
    args = parser.parse_args(argv)

    if not args.source.exists():
        print(f"ERROR: source does not exist: {args.source}", file=sys.stderr)
        return 2

    try:
        mapping = parse_class_map(args.class_map)
    except (ValueError, json.JSONDecodeError) as e:
        print(f"ERROR: invalid --class-map: {e}", file=sys.stderr)
        return 2

    manifest = prepare_dataset(args.source, args.output, class_map=mapping)
    print(f"Wrote {manifest['datasetYaml']}")
    print(f"Wrote {Path(manifest['output']) / 'manifest.json'}")
    print(
        f"images={manifest['imageCount']} labels={manifest['labelCount']} "
        f"invalid={len(manifest['invalidSamples'])}"
    )
    return 0 if len(manifest["invalidSamples"]) == 0 and manifest["imageCount"] > 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
