# Mambo TTS Guidance

Use this guidance when editing narration, timing, or TTS for the prompt-flow video.

## Install

```bash
openclaw skills install @systiger/mambo-tts
```

The Mambo skill depends on the local Edge TTS skill. The current prompt-flow build script calls the Edge TTS converter directly so it can control the output path:

```text
MAMBO_TTS_CONVERTER=<path-to-tts-converter.js>
```

Default local path used by the example:

```text
C:/Users/TT/.openclaw/workspace/skills/edge-tts/scripts/tts-converter.js
```

## Voice

Use the Mambo preset:

```text
voice: zh-CN-XiaoyiNeural
pitch: +8%
rate: default
```

Do not replace it with another voice unless the user explicitly asks.

## Timing Rule

Do not slow, stretch, or compress the Mambo narration just to fit a scene.

Preferred behavior:

1. Generate or reuse natural-speed narration.
2. Let scene durations follow the real audio length.
3. If only changing subtitles or video visuals, copy audio unchanged with `-c:a copy`.

## Generated Files

Do not commit generated MP3/WAV files or TTS segment folders. They are local build artifacts and are ignored by git.

Small text review artifacts such as narration text and corrected SRT files may be committed when they help reproduce the example.
