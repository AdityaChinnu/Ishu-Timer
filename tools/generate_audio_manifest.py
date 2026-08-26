from __future__ import annotations

import json
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
AUDIO_DIR = ROOT_DIR / "assets" / "audio"
MANIFEST_PATH = AUDIO_DIR / "audio-manifest.js"
SUPPORTED_AUDIO_EXTENSIONS = {".mp3", ".m4a", ".wav", ".ogg", ".aac", ".mp4"}


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


def main() -> None:
    entries = build_manifest_entries()
    write_manifest(entries)
    print(f"Generated manifest with {len(entries)} audio file(s): {MANIFEST_PATH}")


if __name__ == "__main__":
    main()