<p align="center">
  <img src="assets/video-flow-icon.png" alt="Video Flow Icon" width="120" />
</p>

<h1 align="center">Video Flow</h1>

<p align="center">
  <a href="README.md">English</a> · 简体中文
</p>

<p align="center">
  一个可复用的视频制作工作流：把 Recordly 录屏变成带 TTS 旁白、字幕、动态解释层和 Hyperframes 渲染的完整视频。
</p>

## 项目介绍

Video Flow 是一个可重复使用的视频制作流程。它适合软件录屏、产品演示、功能解释、发布视频，以及其他以屏幕录制为核心的视频。

当前仓库里的示例项目是 Codex Switch 视频，但结构不是只为 Codex Switch 服务。基本流程是：用 Recordly 录制原始片段，准备稳定的视频素材，生成 Manbo TTS 旁白，对齐字幕，加入动态解释层，验证时间轴，最后用 Hyperframes 渲染 MP4。

核心原则：原始录屏片段要保持完整。需要补时间时，优先调整旁白节奏和解释层动画，不要为了匹配 TTS 把关键录屏内容删掉。

## 功能特点

- Recordly 输入：使用真实屏幕录制作为视频素材。
- 保留完整片段：时间轴使用的 `_kf.mp4` 会保留源视频完整时长。
- Manbo TTS 旁白：按章节生成旁白，并重新对齐到视频节奏。
- 字幕生成：字幕来自旁白文本，并按章节自动分配时间。
- 动态解释层：通过 overlay、图示、callout、协议流程图控制节奏。
- Hyperframes 渲染：使用确定性的 HTML 时间轴，支持校验、布局检查和 MP4 渲染。
- Git 友好：大视频、TTS 输出、渲染结果和缓存不进入普通 git。

## 输出结果

这个工作流会生成：

- `renders/` 里的最终 MP4。
- 用于快速检查画面的 contact sheet。
- 用于审阅的旁白稿。
- 可复现的 Hyperframes composition：`index.html`。
- 可复用到下一个视频的命令链和目录结构。

当前 Codex Switch 示例视频的本地最终渲染文件是：

```text
renders/codex-switch-final-v2.mp4
```

## 工作流程

```text
Recordly 录屏
        |
        v
assets/ 里的原始 MP4
        |
        v
npm run prepare-assets
        |
        v
适合 seek/render 的 *_kf.mp4
        |
        v
npm run build:v2
        |
        +--> Manbo TTS 分段音频
        +--> assets/narration-v2.wav
        +--> narration.v2.zh-CN.md
        +--> index.html 里的字幕
        +--> index.html 里的动态解释层
        |
        v
npm run verify
        |
        v
npm run render
        |
        v
renders/ 里的最终 MP4
```

## 技能和工具

| 工具 | 地址 | 在本流程中的作用 |
| --- | --- | --- |
| Recordly | [官网](https://recordly.dev/) · [GitHub](https://github.com/webadderallorg/Recordly) | 录制初始屏幕视频。 |
| Hyperframes | [文档](https://hyperframes.heygen.com/) · [GitHub](https://github.com/heygen-com/hyperframes) | 构建、校验、检查、预览和渲染视频时间轴。 |
| GSAP | [官网](https://gsap.com/) · [GitHub](https://github.com/greensock/GSAP) | 在 Hyperframes 中驱动解释层、入场动画、协议图和 callout。 |
| Manbo / multi-edge TTS | 本地 skill：`C:/Users/TT/.codex-switch/skills/multi-edge-tts-cn` · 相关引擎：[edge-tts](https://github.com/rany2/edge-tts) | 按章节生成中文旁白音频。 |
| FFmpeg / ffprobe | [官网](https://ffmpeg.org/) · [GitHub](https://github.com/FFmpeg/FFmpeg) | 准备视频片段、生成 `_kf.mp4`、检查时长和渲染结果。 |
| Codex | [OpenAI Codex](https://openai.com/codex/) | 编辑工作流、脚本、时间轴和文档。 |

本地 Manbo / multi-edge TTS skill 不会提交进仓库。脚本通过 `MANBO_TTS_ENGINE` 引用它，所以换机器时可以指向自己的 TTS engine 路径。

仓库还包含两个 agent 指南文件：

- `AGENTS.md`
- `CLAUDE.md`

它们记录了 Hyperframes 的关键规则，比如 timed element、`class="clip"`、注册 timeline、视频静音加独立旁白音轨、确定性渲染，以及必须执行的验证流程。

## 本地输入

把 Recordly 录制的源视频放进 `assets/`：

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

然后执行 `npm run prepare-assets` 生成对应的 `_kf.mp4` 文件。时间轴使用 `_kf.mp4`，因为它们更适合 Hyperframes 稳定 seek 和渲染。

## 命令

```powershell
cd F:\Desktop\Draft\video\codex-switch-hf

npm run prepare-assets
npm run build:v2
npm run verify
npm run render
```

也可以把验证和渲染合在一起：

```powershell
npm run render:final
```

预览 composition：

```powershell
npm run dev
```

`npm run dev` 会启动一个长时间运行的 Hyperframes 预览服务。编辑期间保持它运行即可。

## TTS 设置

默认情况下，`tools/build-v2.mjs` 会在这里寻找 Manbo TTS engine：

```text
C:/Users/TT/.codex-switch/skills/multi-edge-tts-cn/scripts/engine.py
```

如果 engine 在其他位置，设置环境变量：

```powershell
$env:MANBO_TTS_ENGINE = "C:\path\to\engine.py"
```

然后运行：

```powershell
npm run build:v2
```

## 项目结构

```text
video/codex-switch-hf/
  index.html                 Hyperframes composition
  package.json               工作流命令
  hyperframes.json           Hyperframes 配置
  meta.json                  项目元数据
  README.md                  英文文档
  README.zh-CN.md            中文文档
  narration.v2.zh-CN.md      用于审阅的旁白稿
  AGENTS.md                  agent 指南
  CLAUDE.md                  agent 指南
  tools/
    prepare-assets.mjs       原始 MP4 -> *_kf.mp4
    build-v2.mjs             v2 时间轴构建脚本
  assets/
    video-flow-icon.png      README 图标
    *.mp4                    本地源视频，git 忽略
    *_kf.mp4                 本地准备后片段，git 忽略
    narration-v2.wav         生成的旁白音频，git 忽略
    tts-v2/                  生成的 TTS 分段，git 忽略
  renders/                   本地渲染输出，git 忽略
  snapshots/                 本地检查截图，git 忽略
```

## 检查清单

最终渲染前检查：

1. `npm run verify` 没有 error。
2. 最终视频时长和 `assets/narration-v2.wav` 匹配。
3. 每个 `_kf.mp4` 时长和 `tools/build-v2.mjs` 里的章节时长一致。
4. 每段入场都从正确片段开始。
5. 原始录屏片段没有被提前裁掉。
6. 解释层用于控制节奏，而不是靠冻结画面或删除录屏内容。
7. 字幕可读，并且不遮挡关键 UI。
8. contact sheet 覆盖所有主要章节。

## Git 策略

提交：

- 工作流脚本
- `index.html`
- 文档
- 旁白文本
- 小型项目元数据
- 小型静态资源，比如 `video-flow-icon.png`

不要用普通 git 提交：

- 源 MP4 录屏
- 准备后的 `_kf.mp4`
- 生成的 WAV/MP3
- `renders/`
- `snapshots/`
- `.hyperframes/`
- 依赖缓存

大视频和最终渲染结果建议放到 GitHub Releases、外部存储或 Git LFS。

## 说明

- 这是一个视频工作流仓库，不是 Codex Switch 应用本体。
- 当前示例视频关于 Codex Switch，但流程设计是可复用的。
- 如果视频节奏太快，优先调整旁白时长和解释层，不要直接删关键录屏。
- 如果某一段解释不清楚，优先增加动态解释层或图示，而不是重复 UI 画面。

## 协议

MIT License。见 [LICENSE](LICENSE)。
