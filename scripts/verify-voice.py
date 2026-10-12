"""Probe and fully decode every final MP3; this is not human listening QA."""
import concurrent.futures
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
report = json.loads((ROOT / "authoring/voice-production.json").read_text(encoding="utf-8"))
if report["status"] != "complete" or report["errors"]:
    raise ValueError("Only complete voice packs can be verified")


def verify(item):
    key, metadata = item
    filename = (ROOT / "dist" / metadata["src"]).resolve()
    if not filename.is_relative_to((ROOT / "dist/assets/voice").resolve()):
        raise ValueError("Voice path outside its asset directory")
    if hashlib.sha256(filename.read_bytes()).hexdigest() != metadata["sha256"]:
        raise ValueError(f"{key}: hash changed")
    output = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_name,sample_rate,channels:format=duration,size", "-of", "json", str(filename)], capture_output=True, text=True, check=True)
    data = json.loads(output.stdout)
    audio = data["streams"][0]
    if audio["codec_name"] != "mp3" or int(audio["sample_rate"]) != 24000 or audio["channels"] != 1:
        raise ValueError(f"{key}: unexpected audio format")
    if abs(float(data["format"]["duration"]) - metadata["duration"]) > 0.001 or int(data["format"]["size"]) != metadata["bytes"]:
        raise ValueError(f"{key}: metadata changed")
    decoded = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-xerror", "-threads", "1", "-i", str(filename), "-f", "null", "-"], capture_output=True, check=True)
    if decoded.stderr.strip():
        raise ValueError(f"{key}: decoder reported an error")
    return key


with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    verified = list(pool.map(verify, report["clips"].items()))

evidence = {
    "checked": datetime.now(timezone.utc).isoformat(),
    "status": "passed",
    "speaker": report["speaker"],
    "clips": len(verified),
    "bytes": sum(clip["bytes"] for clip in report["clips"].values()),
    "durationSeconds": round(sum(clip["duration"] for clip in report["clips"].values()), 3),
    "codec": "mp3", "sampleRate": 24000, "channels": 1,
    "checks": ["all current file hashes", "all stream formats and metadata", "complete decoding of every MP3 with ffmpeg -xerror"],
    "scope": "Media integrity, not human pronunciation, listening or learning evidence.",
}
(ROOT / "evidence/voice-media-qa.json").write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(evidence, ensure_ascii=False))
