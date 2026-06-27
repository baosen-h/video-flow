<p align="center">
  <img src="assets/video-flow-icon.png" alt="Video Flow Icon" width="120" />
</p>

<h1 align="center">Video Flow</h1>

<p align="center">
  <a href="README.md">English</a> · 简体中文
</p>

<p align="center">
  一个轻量的视频制作工作流：把真实产品录屏变成 HTML 渲染的精致演示视频。
</p>

## 演示

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

## 项目介绍

Video Flow 面向想低成本制作精致录屏视频的人。

核心思路很简单：先录真实产品操作，把录屏当作证据，再用 HTML/CSS/GSAP、TTS、字幕和 Hyperframes 渲染，把这些素材组织成完整视频。

仓库里的完整案例放在 `examples/`。小体积 GIF 会提交到 git，方便别人直接看到效果；大型源视频、生成音频和最终 MP4 不放进普通 git。

## 工作流程

```text
录制真实产品画面
        |
        v
写旁白和分镜
        |
        v
构建 HTML/CSS/GSAP composition
        |
        v
生成或复用 TTS 旁白
        |
        v
用 Hyperframes 渲染
        |
        v
检查关键帧、音频和字幕
```

## 运行要求

- Node.js 和 npm。
- `PATH` 中可用的 FFmpeg / ffprobe。
- Hyperframes：通过 npm scripts 里的 `npx` 调用。
- 可选：给 AI coding agent 用的 Hyperframes skill。
- 可选：如果要重新生成 prompt-flow 旁白，需要 Mambo TTS。

安装 Hyperframes skill：

```powershell
npx skills add https://github.com/heygen-com/hyperframes --skill hyperframes
```

安装 Mambo TTS：

```powershell
openclaw skills install @systiger/mambo-tts
```

prompt-flow 示例可以用这个环境变量指定 TTS converter：

```powershell
$env:MAMBO_TTS_CONVERTER = "<path-to-tts-converter.js>"
```

当前 Mambo 声音配置是 `zh-CN-XiaoyiNeural`，pitch 为 `+8%`。不要为了贴合画面去拉慢 Mambo 音频，应该让画面时长跟随真实音频。

## 快速开始

安装依赖：

```powershell
npm install
```

构建并渲染 prompt-flow 示例。先把完整本地录屏放到：

```text
examples/prompt-flow/assets/codex-flow.mp4
examples/prompt-flow/assets/claude-flow.mp4
```

```powershell
npm run prompt-flow:build
npm run render
```

构建并渲染 codex-switch 示例：

```powershell
npm run example:build
npm run render
```

预览：

```powershell
npm run dev
```

## Examples

`examples/prompt-flow/`

- `tools/build-prompt-flow-v10-mambo.mjs` 构建 prompt-flow composition。
- `ART_DIRECTION.md` 记录视觉方向。
- `assets/*.srt` 和旁白文本是小型审阅文件。
- 需要重建完整视频时，把完整录屏放到 `examples/prompt-flow/assets/`。

`examples/codex-switch/`

- 第二个完整示例，用来展示原始的可复用项目模式。
- 新建视频项目时，可以参考这个文件夹。

## 技能和工具

| 工具 | 作用 |
| --- | --- |
| Hyperframes | 把 HTML/CSS/media/animation 渲染成 MP4。 |
| GSAP | 驱动解释层、入场动画、进度线和 callout。 |
| Mambo TTS | 生成 prompt-flow 演示里使用的中文旁白。 |
| FFmpeg / ffprobe | 检查时长、导出关键帧、烧录字幕。 |
| Whisper | 根据真实音频生成字幕时间轴。 |
| Codex / Claude Code | 辅助修改 HTML、构建脚本、字幕和文档。 |

## 说明

目前最稳定的生产方式是：

```text
真实产品录屏
  + 人写痛点
  + HTML/CSS/GSAP 场景
  + Mambo 旁白
  + Whisper 字幕时间轴
  + FFmpeg 验证
```

小体积 GIF 会作为示例提交。大型视频和生成媒体保留在本地，或通过 Release / 外部存储发布。

## 协议

MIT License。见 [LICENSE](LICENSE)。
