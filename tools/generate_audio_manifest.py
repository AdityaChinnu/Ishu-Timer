from __future__ import annotations

import json
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
AUDIO_DIR = ROOT_DIR / "assets" / "audio"
MANIFEST_PATH = AUDIO_DIR / "audio-manifest.js"
SUPPORTED_AUDIO_EXTENSIONS = {".mp3", ".m4a", ".wav", ".ogg", ".aac", ".mp4"}
CELEBRATION_MEDIA_DIR = ROOT_DIR / "assets" / "celebration-media"
CELEBRATION_MANIFEST_PATH = CELEBRATION_MEDIA_DIR / "celebration-manifest.js"
SUPPORTED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
SUPPORTED_VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".m4v"}


def build_manifest_entries() -> list[dict[str, str]]:
    entries: list[dict[str, str]] = []
    if not AUDIO_DIR.exists():
      return entries

    for file_path in sorted(AUDIO_DIR.iterdir()):
        if not file_path.is_file():
            continue
        if file_path.name == MANIFEST_PATH.name:
            continue
        if file_path.suffix.lower() not in SUPPORTED_AUDIO_EXTENSIONS:
            continue

        entries.append(
            {
                "name": file_path.name,
                "path": f"./assets/audio/{file_path.name}",
            }
        )
    return entries


def write_manifest(entries: list[dict[str, str]]) -> None:
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    manifest_content = (
        "window.BUNDLED_AUDIO_LIBRARY = "
        + json.dumps(entries, indent=2, ensure_ascii=False)
        + ";\n"
    )
    MANIFEST_PATH.write_text(manifest_content, encoding="utf-8")


def build_celebration_manifest_entries() -> list[dict[str, str]]:
    entries: list[dict[str, str]] = []
    if not CELEBRATION_MEDIA_DIR.exists():
        return entries

    for result_name in ("Yes", "No"):
        result_dir = CELEBRATION_MEDIA_DIR / result_name
        if not result_dir.exists():
            continue

        for file_path in sorted(result_dir.iterdir()):
            if not file_path.is_file():
                continue

            suffix = file_path.suffix.lower()
            if suffix in SUPPORTED_IMAGE_EXTENSIONS:
                media_type = "image"
            elif suffix in SUPPORTED_VIDEO_EXTENSIONS:
                media_type = "video"
            else:
                continue

            entries.append(
                {
                    "name": file_path.name,
                    "path": f"./assets/celebration-media/{result_name}/{file_path.name}",
                    "type": media_type,
                    "result": result_name.lower(),
                }
            )

    return entries


def write_celebration_manifest(entries: list[dict[str, str]]) -> None:
    CELEBRATION_MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    manifest_content = (
        "window.BUNDLED_CELEBRATION_MEDIA = "
        + json.dumps(entries, indent=2, ensure_ascii=False)
        + ";\n"
    )
    CELEBRATION_MANIFEST_PATH.write_text(manifest_content, encoding="utf-8")


def main() -> None:
    entries = build_manifest_entries()
    write_manifest(entries)
    celebration_entries = build_celebration_manifest_entries()
    write_celebration_manifest(celebration_entries)
    print(f"Generated manifest with {len(entries)} audio file(s): {MANIFEST_PATH}")
    print(
        f"Generated celebration manifest with {len(celebration_entries)} file(s): {CELEBRATION_MANIFEST_PATH}"
    )


if __name__ == "__main__":
    main()