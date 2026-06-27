<p align="center">
  <img src="assets/video-flow-icon.png" alt="Video Flow Icon" width="120" />
</p>

<h1 align="center">Video Flow</h1>

<p align="center">
  English · <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  Build short product videos with HTML, real footage or animated tutorial videos, TTS, subtitles, and Hyperframes.
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

## What It Is

Video Flow is a small workflow for making product demo videos as code.

The main composition is HTML/CSS/GSAP. Hyperframes renders it to MP4. You can use real product recordings, animated tutorial videos, or both. For narration, the examples use TTS.

## Relationship

```text
video-flow
  -> reusable video workflow

examples/prompt-flow
  -> prompt-flow demo source

examples/codex-switch
  -> another complete example

skills/
  -> agent guidance for Hyperframes and Mambo TTS
```

The GIFs at `examples/*.gif` are preview demos. Full recordings, generated audio, and final MP4 files are local/release assets.

## How It Works

```text
plan the story
  -> build HTML/CSS scenes
  -> add real footage or designed UI
  -> generate or reuse narration
  -> render with Hyperframes
  -> check frames and subtitles
```

## Requirements

- Node.js and npm.
- FFmpeg and ffprobe.
- Hyperframes, called through `npx` in the npm scripts.

Optional skills:

```powershell
npx skills add https://github.com/heygen-com/hyperframes --skill hyperframes
openclaw skills install @systiger/mambo-tts
```

If your Mambo setup uses a custom Edge TTS converter path:

```powershell
$env:MAMBO_TTS_CONVERTER = "<path-to-tts-converter.js>"
```

## Run

Install dependencies:

```powershell
npm install
```

Build prompt-flow:

```powershell
npm run prompt-flow:build
npm run render
```

If rebuilding the full prompt-flow video, place recordings here:

```text
examples/prompt-flow/assets/codex-flow.mp4
examples/prompt-flow/assets/claude-flow.mp4
```

Build codex-switch:

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

- `tools/build-prompt-flow-v10-mambo.mjs` builds the current prompt-flow composition.
- `ART_DIRECTION.md` records the visual direction.
- `assets/*.srt` and narration text are review artifacts.

`examples/codex-switch/`

- A second example for studying the original reusable pattern.

## Tools

| Tool | Role |
| --- | --- |
| Hyperframes | Render HTML video compositions to MP4. |
| GSAP | Animate scenes and explain layers. |
| Mambo TTS | Generate Chinese narration for the prompt-flow demo. |
| FFmpeg / ffprobe | Inspect media, extract frames, burn subtitles. |
| Whisper | Create audio-based subtitle timing. |
| Codex / Claude Code | Help edit the composition, scripts, and docs. |

## License

MIT License. See [LICENSE](LICENSE).
