<p align="center">
  <img src="assets/video-flow-icon.png" alt="Video Flow Icon" width="120" />
</p>

<h1 align="center">Video Flow</h1>

<p align="center">
  English · <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  Reusable workflow for turning Recordly screen recordings into polished videos with TTS narration, subtitles, animated explain layers, and Hyperframes rendering.
</p>

## Introduction

Video Flow is a repeatable video production workflow. It is designed for screen-recorded product demos, walkthroughs, feature explainers, release videos, and other software-focused videos.

The current project builds a Codex Switch video, but the structure is meant to be reused for future videos. Record the source clips with Recordly, prepare stable video assets, generate Manbo TTS narration, align subtitles, add animated explain layers, validate the timeline, and render the final MP4 with Hyperframes.

The key rule is that original screen-recording chips should stay complete. Extra time should come from narration pacing and explain layers, not from cutting away important parts of the source clips.

## Highlights

- Recordly input: use real screen recordings as the source material.
- Full clip preservation: `_kf.mp4` timeline clips keep the full source duration.
- Manbo TTS narration: generated section by section, then retimed to match the video plan.
- Subtitle generation: captions are derived from the narration text and aligned to each section.
- Animated explain layers: use overlays, diagrams, callouts, and protocol visuals to control pacing.
- Hyperframes rendering: deterministic HTML timeline with validation, layout inspection, and MP4 output.
- Git-friendly project: large media, TTS output, render files, and caches stay out of normal git.

## Result

The workflow produces:

- A final rendered MP4 in `renders/`.
- A contact sheet for quick visual review.
- A generated narration script for review.
- A reproducible Hyperframes composition in `index.html`.
- A documented command chain that can be reused for another video.

For this Codex Switch project, the current final local render is:

```text
renders/codex-switch-final-v2.mp4
```

## How It Works

```text
Recordly recordings
        |
        v
Raw MP4 clips in assets/
        |
        v
npm run prepare-assets
        |
        v
Keyframe-friendly *_kf.mp4 clips
        |
        v
npm run build:v2
        |
        +--> Manbo TTS segments
        +--> assets/narration-v2.wav
        +--> narration.v2.zh-CN.md
        +--> subtitles in index.html
        +--> animated explain layers in index.html
        |
        v
npm run verify
        |
        v
npm run render
        |
        v
Final MP4 in renders/
```

## Skills And Tools

This workflow currently uses:

| Tool | Link | Role in this workflow |
| --- | --- | --- |
| Recordly | [Website](https://recordly.dev/) · [GitHub](https://github.com/webadderallorg/Recordly) | Records the initial screen videos. |
| Hyperframes | [Docs](https://hyperframes.heygen.com/) · [GitHub](https://github.com/heygen-com/hyperframes) | Builds, validates, inspects, previews, and renders the video timeline. |
| GSAP | [Website](https://gsap.com/) · [GitHub](https://github.com/greensock/GSAP) | Animates explain layers, scene entrances, protocol diagrams, and callouts inside Hyperframes. |
| Manbo / multi-edge TTS | Local skill: `C:/Users/TT/.codex-switch/skills/multi-edge-tts-cn` · Related engine: [edge-tts](https://github.com/rany2/edge-tts) | Generates Chinese narration audio section by section. |
| FFmpeg / ffprobe | [Website](https://ffmpeg.org/) · [GitHub](https://github.com/FFmpeg/FFmpeg) | Prepares clips, converts recordings into `_kf.mp4`, checks durations, and inspects rendered videos. |
| Codex | [OpenAI Codex](https://openai.com/codex/) | Edits the workflow, scripts, timeline, and documentation. |

The local Manbo / multi-edge TTS skill is not committed to this repository. It is referenced through `MANBO_TTS_ENGINE`, so another machine can point the workflow to its own TTS engine path.

The Hyperframes project also includes agent guidance files:

- `AGENTS.md`
- `CLAUDE.md`

They document framework-specific rules, including timed elements, `class="clip"`, registered timelines, muted videos plus separate narration audio, deterministic rendering, and the required validation loop.

## Required Local Inputs

Place the source Recordly recordings in `assets/`:

```text
1_get_deepseek_api.mp4
2_config_provider_agent.mp4
3_test_deepseek_incodex.mp4
4_vision.mp4
5_websearch.mp4
6_imggenrate.mp4
7_session.mp4
8_setting_github.mp4
```

Then run `npm run prepare-assets` to generate matching `_kf.mp4` files. The timeline uses the `_kf.mp4` files because they are easier for Hyperframes to seek and render reliably.

## Commands

```powershell
cd F:\Desktop\Draft\video\codex-switch-hf

npm run prepare-assets
npm run build:v2
npm run verify
npm run render
```

Or run verification and rendering together:

```powershell
npm run render:final
```

Preview the composition:

```powershell
npm run dev
```

`npm run dev` starts a long-running Hyperframes preview server. Keep it running while editing.

## TTS Setup

By default, `tools/build-v2.mjs` expects the Manbo TTS engine here:

```text
C:/Users/TT/.codex-switch/skills/multi-edge-tts-cn/scripts/engine.py
```

If the engine is somewhere else, set:

```powershell
$env:MANBO_TTS_ENGINE = "C:\path\to\engine.py"
```

Then run:

```powershell
npm run build:v2
```

## Project Structure

```text
video/codex-switch-hf/
  index.html                 Hyperframes composition
  package.json               workflow commands
  hyperframes.json           Hyperframes config
  meta.json                  project metadata
  README.md                  workflow documentation
  narration.v2.zh-CN.md      generated narration script for review
  AGENTS.md                  agent instructions
  CLAUDE.md                  agent instructions
  tools/
    prepare-assets.mjs       raw MP4 -> *_kf.mp4
    build-v2.mjs             canonical v2 timeline builder
  assets/
    video-flow-icon.png      README icon
    *.mp4                    local source clips, ignored by git
    *_kf.mp4                 prepared local clips, ignored by git
    narration-v2.wav         generated narration, ignored by git
    tts-v2/                  generated TTS segments, ignored by git
  renders/                   local render outputs, ignored by git
  snapshots/                 local review snapshots, ignored by git
```

## Review Checklist

Before considering a render final:

1. `npm run verify` has 0 errors.
2. Final video duration matches `assets/narration-v2.wav`.
3. Each `_kf.mp4` duration matches its section duration in `tools/build-v2.mjs`.
4. Scene entrances start with the correct clip.
5. No original screen-recording chip is cut short.
6. Explain layers are used to control pacing instead of freezing or deleting source footage.
7. Subtitles are readable and do not cover important UI.
8. The contact sheet covers all major sections.

## Git Policy

Commit:

- workflow scripts
- `index.html`
- docs
- narration text
- small project metadata
- small static assets such as `video-flow-icon.png`

Do not commit in normal git:

- source MP4 recordings
- prepared `_kf.mp4` clips
- generated WAV/MP3 files
- `renders/`
- `snapshots/`
- `.hyperframes/`
- dependency caches

Use GitHub Releases, external storage, or Git LFS for large source recordings and final videos.

## Notes

- This repository is a workflow, not the Codex Switch application.
- The current example video is about Codex Switch, but the process is intended to be reusable.
- If the video feels too fast, first adjust narration duration and explain layers. Do not cut necessary screen-recording content just to match TTS.
- If a section needs more clarity, add an animated explain layer or diagram instead of repeating the same UI footage.

## License

MIT License. See [LICENSE](LICENSE).
