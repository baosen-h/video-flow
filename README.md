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

## Demos

<table>
  <tr>
    <th align="center">Prompt Flow</th>
    <th align="center">Codex Switch</th>
  </tr>
  <tr>
    <td><img src="examples/prompt-flow.gif" alt="Prompt Flow demo" width="100%" /></td>
    <td><img src="examples/codex-switch.gif" alt="Codex Switch demo" width="100%" /></td>
  </tr>
</table>

## Product Introduction

Video Flow is for people who want to make polished screen-recorded videos with less manual editing.

The core idea is simple: record the real product once, keep the recordings as proof, and build the final video around them with HTML/CSS/GSAP, TTS, subtitles, and Hyperframes rendering.

This repository keeps complete examples under `examples/`. Small preview GIFs are committed so people can immediately see the result. Large source videos, generated audio, and final MP4 renders are kept out of normal git.

## How It Works

```text
Record real product footage
        |
        v
Write narration and scene plan
        |
        v
Build HTML/CSS/GSAP composition
        |
        v
Generate or reuse TTS narration
        |
        v
Render with Hyperframes
        |
        v
Check frames, audio, and subtitles
```

## Requirements

- Node.js and npm.
- FFmpeg and ffprobe in `PATH`.
- Hyperframes, pulled by the npm scripts through `npx`.
- Optional: Hyperframes skill for AI coding agents.
- Optional: Mambo TTS if you regenerate the prompt-flow narration.

Install the Hyperframes skill:

```powershell
npx skills add https://github.com/heygen-com/hyperframes --skill hyperframes
```

Install Mambo TTS:

```powershell
openclaw skills install @systiger/mambo-tts
```

The prompt-flow example can use:

```powershell
$env:MAMBO_TTS_CONVERTER = "<path-to-tts-converter.js>"
```

The current Mambo voice setting is `zh-CN-XiaoyiNeural` with pitch `+8%`. Do not time-stretch the Mambo audio just to fit a scene; let scene timing follow the real audio.

## Quick Start

Install dependencies:

```powershell
npm install
```

Build and render the prompt-flow example. Put the full local recordings here first:

```text
examples/prompt-flow/assets/codex-flow.mp4
examples/prompt-flow/assets/claude-flow.mp4
```

```powershell
npm run prompt-flow:build
npm run render
```

Build and render the codex-switch example:

```powershell
npm run example:build
npm run render
```

Preview:

```powershell
npm run dev
```

## Examples

`examples/prompt-flow/`

- `tools/build-prompt-flow-v10-mambo.mjs` builds the prompt-flow composition.
- `ART_DIRECTION.md` records the visual direction.
- `assets/*.srt` and narration text are small review artifacts.
- Put full recordings in `examples/prompt-flow/assets/` when rebuilding.

`examples/codex-switch/`

- A second complete example showing the original reusable project pattern.
- Use it as a reference when creating a new video example folder.

## Skills And Tools

| Tool | Role |
| --- | --- |
| Hyperframes | Renders HTML/CSS/media/animation into MP4. |
| GSAP | Animates explain layers, scene entrances, progress lines, and callouts. |
| Mambo TTS | Generates the Chinese narration used by the prompt-flow demo. |
| FFmpeg / ffprobe | Checks durations, extracts review frames, and burns subtitles. |
| Whisper | Produces audio-based subtitle timing. |
| Codex / Claude Code | Helps revise the HTML, build scripts, subtitles, and docs. |

## Notes

The most reliable production pattern is:

```text
real product recording
  + human-written pain point
  + HTML/CSS/GSAP scenes
  + Mambo narration
  + Whisper subtitle timing
  + FFmpeg verification
```

Small GIFs are committed as examples. Large videos and generated media should stay local or be published through releases/external storage.

## License

MIT License. See [LICENSE](LICENSE).
