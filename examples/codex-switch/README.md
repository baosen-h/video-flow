# Codex Switch Example

This folder is an example video project for Video Flow.

It is not the universal workflow itself. It exists so users can inspect and run a complete example quickly.

## Files

- `index-example.html` - checked example composition.
- `narration-example.zh-CN.md` - example narration script.
- `tools/build-example.mjs` - example builder that writes the root `index.html`.
- `tools/prepare-assets-example.mjs` - prepares local recordings into `_kf.mp4`.
- `assets/` - local recordings and generated media. Ignored by git.

## Usage

From the repository root:

```powershell
npm run example:prepare
npm run example:build
npm run example:verify
npm run render
```

For a new video, copy this folder, rename it, and update the segment list, source clip names, narration, explain layers, and output filenames.
