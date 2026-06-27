# Mambo TTS Skill Notes

This folder keeps the agent-facing Mambo TTS guidance used by this repository.

It does not vendor generated audio, MP3/WAV files, or `node_modules`. It only documents how agents should call the local Mambo / Edge TTS setup when rebuilding the prompt-flow narration.

Install the OpenClaw skill:

```powershell
openclaw skills install @systiger/mambo-tts
```

The prompt-flow video uses the Mambo preset:

```text
voice: zh-CN-XiaoyiNeural
pitch: +8%
```

When only fixing video layout or subtitles, do not regenerate or time-stretch the narration. Keep the existing audio and use `-c:a copy` during FFmpeg subtitle burns.
