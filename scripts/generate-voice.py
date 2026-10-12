"""Create local Danish MP3 assets from the checked, original voice catalogue.

No credentials or paid API are used. Run the separate voice-runtime interpreter.
Edge is an online production tool; the delivered app only reads local MP3 files.
Piper is available as a fully local production alternative after model download.
"""
import argparse
import asyncio
import hashlib
import json
import re
import subprocess
import time
import wave
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def spoken(text):
    # Unit/code expansions preserve meaning while making Danish speech explicit.
    value = re.sub(r"\bB\s*13\b", "B tretten", text)
    value = re.sub(r"\bB\s*11\b", "B elleve", value)
    value = re.sub(r"\bABS\b", "A B S", value)
    value = re.sub(r"\bESC\b", "E S C", value)
    value = value.replace("km/t", "kilometer i timen").replace("mg/l", "milligram pr. liter")
    value = value.replace("‰", "promille").replace("§", "paragraf ")
    value = re.sub(r"(\d+(?:,\d+)?)\s*mm\b", r"\1 millimeter", value)
    return value


def probe(filename):
    result = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration,size", "-of", "json", str(filename)], capture_output=True, text=True, check=True)
    data = json.loads(result.stdout)["format"]
    duration, size = float(data["duration"]), int(data["size"])
    if duration <= 0.1 or size < 256:
        raise ValueError("Empty or invalid audio")
    return duration, size


def encode(raw, output):
    target = output.with_suffix(".encoding.mp3")
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(raw), "-af", "loudnorm=I=-17:TP=-1.5:LRA=7", "-ac", "1", "-ar", "24000", "-codec:a", "libmp3lame", "-b:a", "48k", str(target)], capture_output=True, check=True)
    metadata = probe(target)
    target.replace(output)
    raw.unlink(missing_ok=True)
    return metadata


def atomic_json(filename, data):
    temp = filename.with_suffix(filename.suffix + ".tmp")
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temp.replace(filename)


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--engine", choices=["edge", "piper"], default="edge")
    parser.add_argument("--voice", choices=["da-DK-JeppeNeural"], default="da-DK-JeppeNeural")
    parser.add_argument("--model", default=str(ROOT.parent / "voice-models/da_DK-talesyntese-medium.onnx"))
    parser.add_argument("--limit", type=int)
    parser.add_argument("--concurrency", type=int, choices=[1, 2, 3, 4], default=4)
    args = parser.parse_args()
    catalogue = json.loads((ROOT / "authoring/voice-catalog.json").read_text(encoding="utf-8"))
    entries = catalogue["entries"]
    if any(not re.fullmatch(r"v1-[0-9a-f]{16}", entry["key"]) for entry in entries):
        raise ValueError("Invalid catalogue key")
    speaker_id = "jeppe-neural-v1" if args.engine == "edge" else "piper-talesyntese-v1"
    destination = (ROOT / "dist/assets/voice" / speaker_id).resolve()
    destination.mkdir(parents=True, exist_ok=True)
    log_path = ROOT / "authoring/voice-production.json"
    previous = json.loads(log_path.read_text(encoding="utf-8")) if log_path.exists() else {}
    expected_speaker = args.voice if args.engine == "edge" else "da_DK-talesyntese-medium"
    cached = previous.get("clips", {}) if previous.get("speakerId") == speaker_id and previous.get("speaker") == expected_speaker else {}
    clips = {}
    # Keep every verified cached entry in checkpoint manifests during a resumed run.
    # Comparing the spoken form also invalidates clips after pronunciation edits.
    for entry in entries:
        key, text = entry["key"], entry["text"]
        prior = cached.get(key)
        filename = destination / (key + ".mp3")
        if prior and prior.get("text") == text and prior.get("spokenText") == spoken(text) and filename.exists() and hashlib.sha256(filename.read_bytes()).hexdigest() == prior.get("sha256"):
            clips[key] = prior
    errors = []
    total = len(entries)
    started = time.monotonic()
    piper_voice = None
    if args.engine == "piper":
        from piper import PiperVoice
        piper_voice = PiperVoice.load(args.model)

    def report(complete=False):
        metadata = {
            "checked": datetime.now(timezone.utc).isoformat(), "engine": args.engine,
            "speakerId": speaker_id, "speaker": args.voice if args.engine == "edge" else "da_DK-talesyntese-medium",
            "catalogueEntries": total, "completed": len(clips), "status": "complete" if complete else "partial",
            "scope": "Generated audio and file/decode metadata; no claim of human listening to every recording or public commercial usage rights.",
            "clips": clips, "errors": errors,
        }
        atomic_json(log_path, metadata)
        public = {"label": "Dansk voiceover", "speaker": "Jeppe · dansk AI-stemme" if args.engine == "edge" else "Lokal dansk AI-stemme", "speakerId": speaker_id, "status": metadata["status"], "clips": {key: {"src": data["src"], "text": data["text"]} for key, data in clips.items()}}
        target = ROOT / "dist/voice-pack.js"
        temp = target.with_suffix(".js.tmp")
        temp.write_text("// Original app text, pre-rendered Danish AI narration. No runtime TTS service.\nexport const VOICE_PACK = " + json.dumps(public, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
        temp.replace(target)

    async def produce(entry):
        key, text = entry["key"], entry["text"]
        output = destination / (key + ".mp3")
        if key in clips:
            return
        raw = destination / (key + (".raw.mp3" if args.engine == "edge" else ".raw.wav"))
        tts_text = spoken(text)
        for attempt in range(3):
            try:
                if args.engine == "edge":
                    import edge_tts
                    await asyncio.wait_for(edge_tts.Communicate(tts_text, args.voice, rate="-4%").save(str(raw)), timeout=90)
                else:
                    with wave.open(str(raw), "wb") as wav_file:
                        piper_voice.synthesize_wav(tts_text, wav_file)
                duration, size = await asyncio.to_thread(encode, raw, output)
                clips[key] = {"src": f"assets/voice/{speaker_id}/{key}.mp3", "text": text, "spokenText": tts_text, "duration": duration, "bytes": size, "sha256": hashlib.sha256(output.read_bytes()).hexdigest()}
                return
            except Exception as error:
                raw.unlink(missing_ok=True)
                if attempt == 2:
                    errors.append({"key": key, "errorType": type(error).__name__})
                    print(f"FAILED {key}: {type(error).__name__}", flush=True)
                else:
                    await asyncio.sleep(2 * (attempt + 1))

    # Bounded concurrency; no new jobs after a systematic failure batch.
    def priority(entry):
        uses = ' '.join(entry.get('uses', []))
        if 'judge:intro' in uses: return 0
        if 'lesson:stop:initial' in uses or 'garage:kobling:case' in uses: return 1
        if 'question:q001:initial' in uses: return 2
        if 'judge:' in uses: return 3
        if 'question:' in uses: return 4
        return 5
    chosen = sorted(entries, key=priority)
    chosen = chosen[:args.limit] if args.limit else chosen
    concurrency = args.concurrency if args.engine == "edge" else 1
    for offset in range(0, len(chosen), concurrency):
        await asyncio.gather(*(produce(entry) for entry in chosen[offset:offset + concurrency]))
        if offset % 20 < concurrency:
            report()
            print(f"VOICE {len(clips)}/{total} · {round(time.monotonic() - started)}s", flush=True)
        if len(errors) >= 6:
            report()
            raise RuntimeError("Six clips failed; stopping rather than continuing requests")
    complete = len(clips) == total and not errors
    report(complete)
    print(json.dumps({"complete": complete, "clips": len(clips), "total": total, "seconds": round(time.monotonic() - started), "bytes": sum(item["bytes"] for item in clips.values())}), flush=True)
    if errors:
        raise RuntimeError("Voice pack remains incomplete")


if __name__ == "__main__":
    asyncio.run(main())
