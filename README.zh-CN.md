<p align="center">
  <img src="assets/video-flow-icon.png" alt="Video Flow Icon" width="120" />
</p>

<h1 align="center">Video Flow</h1>

<p align="center">
  <a href="README.md">English</a> · 简体中文
</p>

<p align="center">
  面向懒人做视频的工作流：只录一遍屏幕，后续旁白、节奏、字幕、解释层和渲染尽量交给 AI 完成。
</p>

## 项目介绍

Video Flow 面向想低成本制作精致录屏视频的人。

核心思路很简单：先用 Recordly 把真实操作流程录一遍，保留原始片段完整性，然后用 AI 辅助工作流把这些素材变成完整视频。AI 参与的部分包括旁白规划、TTS 生成、时长控制、字幕对齐、动态解释层、检查截图和 Hyperframes 渲染。

当前仓库中的 Codex Switch 视频只是一个示例。它用于展示整个流程如何一键跑通，但它的旁白、录屏片段和时间轴设计不是框架本体。后续做新视频时，应该复制或改造 example，而不是把这次示例当成固定模板。

## 项目优势

- 只录一遍：不用同时录截图和视频，也不用反复补录。
- AI 辅助制作：让 AI 处理旁白、解释层、时间轴、字幕和文档整理。
- 保留完整片段：不要为了匹配旁白把原始 video chip 裁断。
- TTS 感知时长：按章节生成旁白，并重新贴合视频节奏。
- 解释层控节奏：用 overlay、callout、图示和动态面板补充说明与填充时间。
- Hyperframes 渲染：用确定性 HTML composition 做校验、布局检查和 MP4 输出。
- 示例集中管理：具体视频项目统一放在 `examples/`。
- Git 友好：大视频、生成音频、渲染结果和缓存不进入普通 git。

## 输出结果

这个工作流会产生：

- 生成的 Hyperframes composition：`index.html`。
- 用于审阅的旁白稿。
- TTS 旁白音频。
- 对齐好的字幕。
- 动态解释层。
- `renders/` 里的最终 MP4。
- 用于快速检查的 contact sheet 或 snapshots。

## 工作流程

```text
用 Recordly 录一遍
        |
        v
把源 MP4 放到 example assets 文件夹
        |
        v
准备适合 seek 的 *_kf.mp4
        |
        v
AI 辅助 build 脚本
        |
        +--> 旁白稿
        +--> TTS 音频
        +--> 字幕时间
        +--> 动态解释层
        +--> Hyperframes index.html
        |
        v
校验和检查
        |
        v
渲染最终 MP4
```

## 快速运行示例

克隆并进入仓库：

```powershell
git clone https://github.com/baosen-h/video-flow.git
cd video-flow
```

把 Codex Switch 示例录屏放到：

```text
examples/codex-switch/assets/
```

运行示例：

```powershell
npm run example:prepare
npm run example:build
npm run example:verify
npm run render
```

也可以把验证和渲染合并：

```powershell
npm run example:render
```

预览：

```powershell
npm run dev
```

`npm run dev` 会启动一个长时间运行的 Hyperframes 预览服务。

## Examples

当前示例是：

```text
examples/codex-switch/
```

它包含：

- `index-example.html` - 示例 composition。
- `narration-example.zh-CN.md` - 示例旁白，只用于 Codex Switch 视频。
- `tools/build-example.mjs` - 示例时间轴和 TTS 构建脚本。
- `tools/prepare-assets-example.mjs` - 示例视频素材准备脚本。
- `assets/` - 本地示例录屏和生成媒体，git 忽略。

`*-example` 命名是故意的。它表示这些文件只是一个视频案例，不是通用框架本体。做新视频时，复制 example 文件夹，然后修改录屏、章节列表、旁白、解释层和输出名。

## 技能和工具

| 工具 | 地址 | 在本流程中的作用 |
| --- | --- | --- |
| Recordly | [官网](https://recordly.dev/) · [GitHub](https://github.com/webadderallorg/Recordly) | 录制初始屏幕视频。 |
| Hyperframes | [文档](https://hyperframes.heygen.com/) · [GitHub](https://github.com/heygen-com/hyperframes) | 构建、校验、检查、预览和渲染视频时间轴。 |
| GSAP | [官网](https://gsap.com/) · [GitHub](https://github.com/greensock/GSAP) | 在 Hyperframes 中驱动解释层、入场动画、协议图和 callout。 |
| Manbo / multi-edge TTS | 本地 skill：`~/.codex-switch/skills/multi-edge-tts-cn` · 相关引擎：[edge-tts](https://github.com/rany2/edge-tts) | 按章节生成中文旁白音频。 |
| FFmpeg / ffprobe | [官网](https://ffmpeg.org/) · [GitHub](https://github.com/FFmpeg/FFmpeg) | 准备视频片段、生成 `_kf.mp4`、检查时长和渲染结果。 |
| Codex | [OpenAI Codex](https://openai.com/codex/) | 编辑工作流、脚本、时间轴和文档。 |

skill 相关说明统一放在：

```text
skills/hyperframes/
```

本地 Manbo / multi-edge TTS skill 不提交进仓库。可以通过 `MANBO_TTS_ENGINE` 配置，或者放在用户自己的 home 目录：

```text
<your-home>/.codex-switch/skills/multi-edge-tts-cn/scripts/engine.py
```

## TTS 设置

推荐使用环境变量：

```powershell
$env:MANBO_TTS_ENGINE = "<path-to-engine.py>"
```

如果没有设置 `MANBO_TTS_ENGINE`，示例构建脚本会回退到：

```text
<your-home>/.codex-switch/skills/multi-edge-tts-cn/scripts/engine.py
```

这样不会硬编码某个 Windows 用户名。

## 项目结构

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
        *.mp4                 本地录屏，git 忽略
        *_kf.mp4              准备后片段，git 忽略
        narration-example.wav 生成旁白，git 忽略
        tts-example/          生成 TTS 分段，git 忽略
  renders/                    本地渲染输出，git 忽略
  snapshots/                  本地检查截图，git 忽略
```

仓库根目录的 `index.html` 由 `npm run example:build` 生成，并被 git 忽略。

## 检查清单

最终渲染前检查：

1. `npm run verify` 没有 error。
2. 最终视频时长和生成的旁白音频匹配。
3. 每个 `_kf.mp4` 时长和 example builder 里的章节时长一致。
4. 每段入场都从正确片段开始。
5. 原始录屏片段没有被提前裁掉。
6. 解释层用于控制节奏，而不是靠冻结画面或删除录屏内容。
7. 字幕可读，并且不遮挡关键 UI。
8. contact sheet 或 snapshots 覆盖所有主要章节。

## Git 策略

提交：

- 工作流脚本
- example 脚本和 example 旁白文本
- 文档
- 小型项目元数据
- 小型静态资源，比如 `video-flow-icon.png`
- skill 指南文档

不要用普通 git 提交：

- 源 MP4 录屏
- 准备后的 `_kf.mp4`
- 生成的 WAV/MP3
- 生成的根目录 `index.html`
- `renders/`
- `snapshots/`
- `.hyperframes/`
- 依赖缓存

大视频和最终渲染结果建议放到 GitHub Releases、外部存储或 Git LFS。

## 协议

MIT License。见 [LICENSE](LICENSE)。
