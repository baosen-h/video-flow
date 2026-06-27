<p align="center">
  <img src="assets/video-flow-icon.png" alt="Video Flow Icon" width="120" />
</p>

<h1 align="center">Video Flow</h1>

<p align="center">
  English · <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  A lightweight workflow for turning real product recordings into polished HTML-rendered demo videos.
</p>

## Product Introduction

Video Flow is for people who want to make polished screen-recorded videos with less manual editing.

The core idea is simple: record the real product or workflow once, keep the original clips as proof, and use an AI-assisted HTML video pipeline to build the finished video around those clips. The workflow covers narration planning, TTS generation, timing, subtitles, animated explain layers, review frames, and Hyperframes rendering.

This repository is currently optimized around the `prompt-flow` demo video. The prompt-flow example is useful because it shows the whole production loop: real Codex and Claude Code recordings, a short spoken story, HTML/CSS/GSAP visual scenes, Mambo TTS, Whisper-timed subtitles, and a final MP4 render.

## Highlights

- One recording pass: capture the real workflow instead of manually collecting many small screenshots.
- HTML-first video layout: use HTML/CSS for typography, UI panels, terminal frames, flow diagrams, and explain layers.
- GSAP motion: animate scene entrances, step progress, and demo highlights in a deterministic way.
- Hyperframes rendering: turn the HTML composition into an MP4.
- Mambo TTS support: generate Chinese narration with the Mambo voice without slowing or stretching it.
- Subtitle verification: use Whisper timing plus manual correction instead of relying only on estimated text timing.
- Real demo proof: product recordings stay visible and are not replaced by fake UI.
- Git-friendly storage: large recordings, generated audio, renders, and caches stay out of normal git.

## What You Get

The workflow can produce:

- a generated Hyperframes composition: `index.html`;
- a narration script for review;
- TTS narration audio;
- timed subtitles;
- animated explain layers;
- a final MP4 in `renders/`;
- optional snapshots for checking layout and subtitle placement.

## How It Works

```text
Record the real product workflow
        |
        v
Place source MP4s in assets/
        |
        v
Write the narration and scene plan
        |
        v
Build HTML/CSS/GSAP composition
        |
        +--> product footage
        +--> explain layers
        +--> TTS narration
        +--> scene timing
        +--> subtitle layer
        |
        v
Render with Hyperframes
        |
        v
Check frames, audio duration, and subtitles
        |
        v
Burn corrected subtitles with FFmpeg when needed
```

## Requirements

Install these before running the workflow:

- Node.js and npm.
- FFmpeg and ffprobe available in `PATH`.
- A browser-capable Windows/macOS/Linux environment for Hyperframes rendering.

Hyperframes itself is pulled through `npx` by the package scripts:

```powershell
npm run render
```

If you want an AI coding agent to understand the Hyperframes production loop, install the Hyperframes skill:

```powershell
npx skills add https://github.com/heygen-com/hyperframes --skill hyperframes
```

The prompt-flow demo also uses Mambo TTS. Install the OpenClaw skill if you want to regenerate the Mambo narration:

```powershell
openclaw skills install @systiger/mambo-tts
```

In the current local prompt-flow build, Mambo is called through the Edge TTS converter:

```text
C:/Users/TT/.openclaw/workspace/skills/edge-tts/scripts/tts-converter.js
```

You can override that path with:

```powershell
$env:MAMBO_TTS_CONVERTER = "<path-to-tts-converter.js>"
```

The current Mambo voice configuration is:

```text
voice: zh-CN-XiaoyiNeural
pitch: +8%
```

Do not time-stretch the Mambo audio just to fit a scene. Let scene durations follow the real generated audio, or copy the audio stream unchanged when only fixing video/subtitles.

## Quick Start

Install dependencies:

```powershell
cd F:\Desktop\Draft\video-flow
npm install
```

Render the current composition:

```powershell
npm run render
```

Preview the composition:

```powershell
npm run dev
```

`npm run dev` starts a long-running Hyperframes preview server.

Verify the composition:

```powershell
npm run verify
```

## Prompt-Flow Demo

The current working demo uses:

```text
assets/codex-flow.mp4
assets/claude-flow.mp4
tools/build-prompt-flow-v10-mambo.mjs
assets/prompt-flow-v10-narration.wav
assets/prompt-flow-v10.aligned.zh.srt
```

The best current render is:

```text
renders/prompt-flow-demo-v12-subfix.mp4
```

That version was made by:

1. rendering the clean HTML video without the oversized HTML subtitle layer;
2. using Whisper timing from the real Mambo audio;
3. manually correcting the subtitle text;
4. burning the corrected SRT with FFmpeg;
5. copying the audio stream unchanged with `-c:a copy`.

This matters because the previous HTML subtitle timing was based on text-length estimates. It looked acceptable in code, but the real video needed audio-based timing and smaller subtitle styling.

## Useful Commands

Check a video duration:

```powershell
ffprobe -v error -show_entries stream=index,codec_type,duration -show_entries format=duration,size -of default=noprint_wrappers=1 "renders\prompt-flow-demo-v12-subfix.mp4"
```

Extract a review frame:

```powershell
ffmpeg -y -ss 00:00:50 -i "renders\prompt-flow-demo-v12-subfix.mp4" -frames:v 1 -update 1 "renders\v12-shot-50.png"
```

Burn corrected subtitles while keeping audio unchanged:

```powershell
ffmpeg -y `
  -i "renders\video-flow_2026-06-27_01-46-25.mp4" `
  -vf "subtitles='F\:/Desktop/Draft/video-flow/assets/prompt-flow-v10.aligned.zh.srt':force_style='FontName=Microsoft YaHei,FontSize=10,PrimaryColour=&H00151716,OutlineColour=&H00FFFFFF,BackColour=&HDCF8F8F4,BorderStyle=4,Outline=0.6,Shadow=0,MarginV=18'" `
  -c:v libx264 -pix_fmt yuv420p -preset medium -crf 18 `
  -c:a copy `
  "renders\prompt-flow-demo-v12-subfix.mp4"
```

## Skills And Tools

| Tool | Link | Role in this workflow |
| --- | --- | --- |
| Hyperframes | [GitHub](https://github.com/heygen-com/hyperframes) · [Docs](https://hyperframes.heygen.com/) | Renders HTML/CSS/media/animation into deterministic MP4 videos. |
| Hyperframes skill | [Install](https://github.com/heygen-com/hyperframes) | Teaches Codex, Claude Code, Cursor, Gemini CLI, and other agents the Hyperframes video workflow. |
| Mambo TTS | [ClawHub](https://clawhub.ai/systiger/skills/mambo-tts) | Generates the Mambo-style Chinese narration used by the prompt-flow demo. |
| OpenClaw | [Docs](https://docs.openclaw.ai/clawhub) | Installs and manages ClawHub skills such as `@systiger/mambo-tts`. |
| GSAP | [Website](https://gsap.com/) | Animates explain layers, scene entrances, progress lines, and callouts. |
| FFmpeg / ffprobe | [Website](https://ffmpeg.org/) | Probes durations, prepares media, extracts review frames, and burns subtitles. |
| Whisper | Local or external transcription tool | Produces audio-based subtitle timing for the narration. |
| Codex / Claude Code | Local coding agents | Help write and revise the HTML, build scripts, subtitles, and docs. |

## Project Structure

```text
video-flow/
  README.md
  README.zh-CN.md
  LICENSE
  package.json
  hyperframes.json
  meta.json
  index.html
  assets/
    video-flow-icon.png
    codex-flow.mp4
    claude-flow.mp4
    prompt-flow-v10-narration.wav
    prompt-flow-v10.aligned.zh.srt
  tools/
    build-prompt-flow-v8.mjs
    build-prompt-flow-v9.mjs
    build-prompt-flow-v10-mambo.mjs
  skills/
    hyperframes/
      AGENTS.md
      CLAUDE.md
  renders/
    prompt-flow-demo-v12-subfix.mp4
```

Large local media files may be ignored by git. If a fresh clone lacks assets such as recordings, generated narration, or rendered videos, regenerate them locally or download them from the release/storage location used by the project.

## Review Checklist

Before considering a render final:

1. `npm run verify` has no blocking errors.
2. The final video duration matches the intended narration.
3. Mambo audio has not been slowed or stretched accidentally.
4. Subtitles are readable and do not cover important UI.
5. Subtitle timing is based on the real audio, preferably from Whisper plus manual correction.
6. Codex and Claude Code recordings clearly prove the workflow.
7. The first scene explains the pain quickly.
8. The video still makes sense with sound off.
9. Key frames have been checked with screenshots, not only by watching the full render once.

## Notes From The Prompt-Flow Video

The most reliable production pattern was:

```text
real product recording
  + human-written pain point
  + HTML/CSS/GSAP scenes
  + Mambo narration
  + Whisper subtitle timing
  + FFmpeg verification
```

Claude Code and Codex are useful for iteration, but final taste still needs human review. In particular, do not trust generated subtitle placement until you inspect frames from the rendered MP4.

## Git Policy

Commit:

- workflow scripts;
- example scripts and narration text;
- docs;
- small project metadata;
- small static assets such as `video-flow-icon.png`;
- skill guidance documents.

Do not commit in normal git:

- large source MP4 recordings;
- generated WAV/MP3 files;
- generated renders;
- snapshots;
- `.hyperframes/`;
- dependency caches.

Use GitHub Releases, external storage, or Git LFS for large source recordings and final videos.

## License

MIT License. See [LICENSE](LICENSE).
