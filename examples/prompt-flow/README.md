# Prompt Flow Example

This folder contains the prompt-flow demo video source.

The lightweight preview GIF is committed at:

```text
examples/prompt-flow.gif
```

Large recordings and generated audio are intentionally kept out of git. To rebuild the full video, place the real recordings here:

```text
examples/prompt-flow/assets/codex-flow.mp4
examples/prompt-flow/assets/claude-flow.mp4
```

Then run from the repository root:

```powershell
npm run prompt-flow:build
npm run render
```

Regenerating the narration needs Mambo TTS:

```powershell
openclaw skills install @systiger/mambo-tts
```

Use `SKIP_TTS=1` if the narration WAV already exists in `examples/prompt-flow/assets/`.
