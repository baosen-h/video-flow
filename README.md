<p align="center">
  <img src="assets/video-flow-icon.png" alt="Video Flow Icon" width="120" />
</p>

<h1 align="center">Video Flow</h1>

<p align="center">
  English · <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  A lazy video-making workflow: record the screen once, then let AI handle narration, timing, subtitles, explain layers, and rendering.
</p>

## Product Introduction

Video Flow is for people who want to make polished screen-recorded videos with minimum manual editing.

The core idea is simple: record the product or workflow once with Recordly, keep the original clips complete, and let the AI workflow turn that footage into a finished video. The AI-assisted steps include narration planning, TTS generation, duration control, subtitle timing, animated explain layers, review frames, and Hyperframes rendering.

The Codex Switch video in this repository is only an example. It is included so the workflow can be run and studied immediately, but future videos should copy or adapt the example instead of treating its narration, clips, and scene plan as the framework itself.

## Highlights

- One recording pass: capture the real workflow once instead of recording screenshots and videos separately.
- AI-assisted production: use AI to write narration, add explain layers, control pacing, and organize the timeline.
- Full clip preservation: the workflow should not cut original video chips just to match narration.
- TTS-aware timing: generated narration is retimed to fit each section.
- Explain-layer pacing: overlays, callouts, diagrams, and animated panels add clarity and fill time.
- Hyperframes rendering: deterministic HTML composition, validation, layout inspection, and MP4 output.
- Example-first layout: project-specific files live under `examples/`.
- Git-friendly storage: large recordings, generated audio, renders, and caches stay out of normal git.

## What You Get

The workflow produces:

- A generated Hyperframes composition: `index.html`.
- A narration script for review.
- TTS narration audio.
- Timed subtitles.
- Animated explain layers.
- A final MP4 in `renders/`.
- Optional contact sheets and snapshots for quick review.

## How It Works

```text
Record once with Recordly
        |
        v
Place source MP4s in an example assets folder
        |
        v
Prepare seek-friendly *_kf.mp4 clips
        |
        v
AI-assisted build script
        |
        +--> narration script
        +--> TTS audio
        +--> subtitle timing
        +--> explain layers
        +--> Hyperframes index.html
        |
        v
Validate and inspect
        |
        v
Render final MP4
```

## Quick Start With The Example

Clone and install:

```powershell
git clone https://github.com/baosen-h/video-flow.git
cd video-flow
```

Put the Codex Switch example recordings in:

```text
examples/codex-switch/assets/
```

Run the example:

```powershell
npm run example:prepare
npm run example:build
npm run example:verify
npm run render
```

Or run verification and rendering together:

```powershell
npm run example:render
```

Preview:

```powershell
npm run dev
```

`npm run dev` starts a long-running Hyperframes preview server.

## Examples

The current example is:

```text
examples/codex-switch/
```

It contains:

- `index-example.html` - example generated/checked composition.
- `narration-example.zh-CN.md` - example narration, only for the Codex Switch video.
- `tools/build-example.mjs` - example timeline and TTS builder.
- `tools/prepare-assets-example.mjs` - example source video preparation.
- `assets/` - local example recordings and generated media, ignored by git.

The `*-example` names are intentional. They make it clear that these files demonstrate one video, not the universal workflow. For a new video, copy the example folder and adjust the clips, segment list, narration text, explain layers, and output names.

## Skills And Tools

| Tool | Link | Role in this workflow |
| --- | --- | --- |
| Recordly | [Website](https://recordly.dev/) · [GitHub](https://github.com/webadderallorg/Recordly) | Records the initial screen videos. |
| Hyperframes | [Docs](https://hyperframes.heygen.com/) · [GitHub](https://github.com/heygen-com/hyperframes) | Builds, validates, inspects, previews, and renders the video timeline. |
| GSAP | [Website](https://gsap.com/) · [GitHub](https://github.com/greensock/GSAP) | Animates explain layers, scene entrances, protocol diagrams, and callouts inside Hyperframes. |
| Manbo / multi-edge TTS | Local skill: `~/.codex-switch/skills/multi-edge-tts-cn` · Related engine: [edge-tts](https://github.com/rany2/edge-tts) | Generates Chinese narration audio section by section. |
| FFmpeg / ffprobe | [Website](https://ffmpeg.org/) · [GitHub](https://github.com/FFmpeg/FFmpeg) | Prepares clips, converts recordings into `_kf.mp4`, checks durations, and inspects rendered videos. |
| Codex | [OpenAI Codex](https://openai.com/codex/) | Edits the workflow, scripts, timeline, and documentation. |

Skill-related guidance is organized under:

```text
skills/hyperframes/
```

The local Manbo / multi-edge TTS skill is not committed to this repository. Configure it with `MANBO_TTS_ENGINE` or place it under your own home directory:

```text
<your-home>/.codex-switch/skills/multi-edge-tts-cn/scripts/engine.py
```

## TTS Setup

Recommended portable setup:

```powershell
$env:MANBO_TTS_ENGINE = "<path-to-engine.py>"
```

If `MANBO_TTS_ENGINE` is not set, the example builder falls back to:

```text
<your-home>/.codex-switch/skills/multi-edge-tts-cn/scripts/engine.py
```

This avoids hard-coding any specific Windows account name.

## Project Structure

```text
video-flow/
  README.md
  README.zh-CN.md
  LICENSE
  package.json
  hyperframes.json
  meta.json
  assets/
    video-flow-icon.png
  skills/
    hyperframes/
      AGENTS.md
      CLAUDE.md
  examples/
    codex-switch/
      index-example.html
      narration-example.zh-CN.md
      tools/
        build-example.mjs
        prepare-assets-example.mjs
      assets/
        *.mp4                 local recordings, ignored by git
        *_kf.mp4              prepared clips, ignored by git
        narration-example.wav generated narration, ignored by git
        tts-example/          generated TTS segments, ignored by git
  renders/                    local renders, ignored by git
  snapshots/                  local review snapshots, ignored by git
```

`index.html` at the repository root is generated by `npm run example:build` and is ignored by git.

## Review Checklist

Before considering a render final:

1. `npm run verify` has 0 errors.
2. Final video duration matches the generated narration audio.
3. Each `_kf.mp4` duration matches its section duration in the example builder.
4. Scene entrances start with the correct clip.
5. No original screen-recording chip is cut short.
6. Explain layers are used to control pacing instead of freezing or deleting source footage.
7. Subtitles are readable and do not cover important UI.
8. Contact sheets or snapshots cover all major sections.

## Git Policy

Commit:

- workflow scripts
- example scripts and example narration text
- docs
- small project metadata
- small static assets such as `video-flow-icon.png`
- skill guidance documents

Do not commit in normal git:

- source MP4 recordings
- prepared `_kf.mp4` clips
- generated WAV/MP3 files
- generated root `index.html`
- `renders/`
- `snapshots/`
- `.hyperframes/`
- dependency caches

Use GitHub Releases, external storage, or Git LFS for large source recordings and final videos.

## License

MIT License. See [LICENSE](LICENSE).
