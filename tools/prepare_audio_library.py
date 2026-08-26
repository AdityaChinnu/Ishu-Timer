from __future__ import annotations

import argparse
import subprocess
from pathlib import Path

from imageio_ffmpeg import get_ffmpeg_exe


ROOT_DIR = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT_DIR / "assets" / "media"
OUTPUT_DIR = ROOT_DIR / "assets" / "audio"
MANIFEST_SCRIPT = ROOT_DIR / "tools" / "generate_audio_manifest.py"
SUPPORTED_SOURCE_EXTENSIONS = {".mp4", ".m4a", ".mov", ".webm", ".mp3", ".wav", ".ogg", ".aac"}


def strip_all_suffixes(file_path: Path) -> str:
    base_name = file_path.name
    for suffix in file_path.suffixes:
        if base_name.lower().endswith(suffix.lower()):
            base_name = base_name[: -len(suffix)]
    return base_name


def convert_media_to_mp3(source_path: Path, output_path: Path, ffmpeg_executable: str) -> None:
    command = [
        ffmpeg_executable,
        "-y",
        "-i",
        str(source_path),
        "-vn",
        "-codec:a",
        "libmp3lame",
        "-q:a",
        "2",
        str(output_path),
    ]
    subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def prepare_audio_library(delete_source: bool) -> None:
    if not SOURCE_DIR.exists():
        print(f"Source folder not found: {SOURCE_DIR}")
        return

    ffmpeg_executable = get_ffmpeg_exe()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    converted_count = 0
    for source_path in sorted(SOURCE_DIR.iterdir()):
        if not source_path.is_file():
            continue
        if source_path.suffix.lower() not in SUPPORTED_SOURCE_EXTENSIONS:
            continue

        output_file_name = f"{strip_all_suffixes(source_path)}.mp3"
        output_path = OUTPUT_DIR / output_file_name
        convert_media_to_mp3(source_path, output_path, ffmpeg_executable)
        converted_count += 1
        print(f"Converted: {source_path.name} -> {output_path.name}")

    subprocess.run(["py", str(MANIFEST_SCRIPT)], check=True)

    if delete_source:
        for source_path in SOURCE_DIR.iterdir():
            if source_path.is_file():
                source_path.unlink()
        SOURCE_DIR.rmdir()
        print(f"Deleted source folder: {SOURCE_DIR}")

    print(f"Finished preparing audio library. Converted {converted_count} file(s).")


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert media files into a bundled mp3 audio library.")
    parser.add_argument(
        "--delete-source",
        action="store_true",
        help="Delete the assets/media folder after converting all supported files.",
    )
    args = parser.parse_args()
    prepare_audio_library(delete_source=args.delete_source)


if __name__ == "__main__":
    main()