import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(projectDir, "index.html");
const ttsDir = path.join(projectDir, "assets/tts-v2");
const engine =
  process.env.MANBO_TTS_ENGINE ||
  "C:/Users/TT/.codex-switch/skills/multi-edge-tts-cn/scripts/engine.py";
const narrationOut = path.join(projectDir, "assets/narration-v2.wav");
const narrationMd = path.join(projectDir, "narration.v2.zh-CN.md");

if (!fs.existsSync(engine)) {
  throw new Error(
    `TTS engine not found: ${engine}\nSet MANBO_TTS_ENGINE to the engine.py path.`,
  );
}

const segments = [
  {
    id: "api",
    title: "获取 DeepSeek API",
    duration: 40.9,
    video: "assets/1_get_deepseek_api_kf.mp4",
    overlay: "从 API Key 到官方文档",
    text: `大家好啊，我是新人 UP 主。今天这期不搞花活，直接用一段完整流程，看 Codex Switch 怎么把 DeepSeek 接进 Codex。

我先从 DeepSeek 开放平台开始。这里进入 API Keys 页面，新建一个 API Key。这个 Key 只会显示一次，所以创建以后要先保存好。

然后打开官方 API 文档，确认三个信息：Base URL，可以使用的模型，以及接口使用的请求格式。

后面在 Codex Switch 里创建 Provider，主要就是把这些信息填进去。遇到接入问题时，也尽量先回到官方文档确认，不要靠猜。`,
    notes: ["API Key 只显示一次", "Base URL / Model / Wire format", "后面创建 Provider 会用到"],
  },
  {
    id: "provider",
    title: "创建 Provider 和 Codex 配置",
    duration: 52.066667,
    video: "assets/2_config_provider_agent_kf.mp4",
    overlay: "Provider 保存一套可复用连接信息",
    text: `现在回到 Codex Switch。

打开 Providers 页面，新建一个 DeepSeek Provider。Provider 可以理解成一套 API 连接信息，之后其他功能要调用 DeepSeek，就不用每个地方重新填一遍。

这里填写服务商类型、Base URL 和刚才创建的 API Key。比较关键的是 Wire format。它不是一个摆设，而是告诉本地代理，收到请求以后应该按哪一种协议处理。

为了保留真实排查过程，我这里先没有把 Wire format 设置成正确的 Chat Completions。

保存以后刷新模型列表。模型能正常返回，说明地址和 Key 至少是通的。

接着进入 Agents 页面，为 Codex 新建配置。选择刚才的 DeepSeek Provider，再选择模型，保存并启用。到这里，配置写入已经完成，下一步就直接启动 Codex 测试。`,
    notes: ["Provider = 连接信息", "模型列表能刷新，只代表认证基本没问题", "真正对话还要看 Wire format"],
  },
  {
    id: "failure",
    title: "保留一次真实失败",
    duration: 54.3,
    video: "assets/3_test_deepseek_incodex_kf.mp4",
    overlay: "模型列表成功，不等于对话一定成功",
    text: `第一次启动 Codex，可以看到它没有正常跑起来。

这个失败不是剪掉，而是故意保留下来，因为接第三方模型时经常会遇到这种情况：模型列表能刷出来，但真正聊天的时候失败。

这时先不要急着怀疑网络或者 API Key。刚才模型列表已经能返回，说明 Base URL 和认证大概率是好的。

更应该检查的是模型名称和请求协议。

回到 DeepSeek Provider，问题就在 Wire format。Codex 原生发送的是 Responses API 请求，而 DeepSeek 这里接收的是 Chat Completions。

把 Wire format 改成 Chat Completions，保存，再回到 Agents 页面重新启用配置，然后重新启动 Codex。

这一次 DeepSeek 正常返回结果。以后如果出现“模型列表能刷新，但是对话不能用”，优先检查 Base URL、模型名称和 Wire format。`,
    notes: ["失败先保留", "先排除 Key 和地址", "再查模型名和协议"],
  },
  {
    id: "protocol",
    title: "本地协议转换",
    duration: 32,
    video: null,
    overlay: "Responses API ⇄ Chat Completions",
    text: `这里单独停一下，看它为什么改完 Wire format 就能用了。

Codex 仍然按自己的方式发送 Responses API 请求。

Codex Switch 会在本机启动一个兼容代理。请求先进到本机的 127.0.0.1，端口是 47632。

代理把请求转换成 DeepSeek 能识别的 Chat Completions 格式，再发给 DeepSeek。

模型返回以后，代理再把响应转换回 Codex 需要的格式。

所以这里真正解决的，不只是配置集中管理，而是协议之间的差异被本机代理接住了。`,
    notes: ["Codex 发 Responses", "本机代理转换协议", "DeepSeek 接 Chat Completions"],
  },
  {
    id: "vision",
    title: "给纯文本模型补图片理解",
    duration: 83.066667,
    video: "assets/4_vision_kf.mp4",
    overlay: "视觉模型只负责看图，DeepSeek 继续负责推理",
    text: `协议问题解决以后，DeepSeek 已经可以在 Codex 里处理文本任务了。

但纯文本模型还有一个很现实的限制：它本身不能直接理解图片。

如果把图片任务直接交给 DeepSeek，请求链路就没有合适的模型来处理图片内容。

在 Codex Switch 的视觉设置里，可以额外选择一个支持图片输入的 Provider 和模型。这个模型不替代 DeepSeek，它只是负责看图。

当 Codex 遇到图片任务时，图片会先交给视觉模型。视觉模型读取图片内容，生成一段文本描述。

然后 Codex Switch 再把这段描述作为上下文交给 DeepSeek。DeepSeek 仍然负责后续分析、改代码和回答问题。

这样做的好处是，主模型不用原生支持图片，也能参与包含截图、界面、报错图片的任务。

这里的视觉模型可以和主模型使用不同的 Provider。比如主模型用 DeepSeek，视觉模型可以单独选择一个支持图片输入的服务。

配置完成以后，后续图片任务不需要每次手动切换。Codex Switch 会按设置好的链路，把图片先送给视觉模型，再把整理后的描述交给主模型。

所以它更像是给纯文本模型补了一块能力，而不是强行要求所有模型都支持同样的输入格式。

当然，本质上不是 DeepSeek 突然会看图了，而是前面多了一步视觉描述，把它原本缺少的信息补上。`,
    notes: ["图片 → 视觉模型", "视觉模型 → 文本描述", "描述 → DeepSeek 继续处理"],
  },
  {
    id: "search",
    title: "给模型接上联网搜索",
    duration: 95.433333,
    video: "assets/5_websearch_kf.mp4",
    overlay: "搜索由工具完成，模型负责整理答案",
    text: `接下来是网页搜索。

有些模型本身没有联网搜索能力，或者在 Codex 里没有现成的搜索工具。这种情况下，可以在 Codex Switch 里配置 Web Search。

这里我使用的是 Tavily。填入 API Key 以后，再选择网页内容的读取方式，然后保存。

回到 Codex，让它搜索一个需要联网获取的信息。

终端里可以看到，模型不是自己凭空回答，而是调用了本地提供的 web search 工具。

如果搜索结果里还需要读取具体页面，就继续调用 web fetch，把网页内容取回来。

工具把搜索结果和网页内容返回以后，DeepSeek 再根据这些内容整理最终回答。

所以这套链路里，搜索和网页读取是工具完成的，模型负责理解结果、组织答案，并保留信息来源。

这个过程也方便排查。你可以在终端里看到实际调用了哪个工具，搜索到了哪些结果，后面又读取了哪些页面。

如果回答不对，就能判断问题是搜索关键词不合适、网页内容不够，还是模型整理结果时理解错了。

这对第三方模型很有用。即使主模型没有原生联网能力，也可以在 Agent 里完成需要最新网页信息的任务。

换句话说，联网能力不是直接塞进模型里，而是通过本地工具补给 Agent。模型负责思考，工具负责把最新信息拿回来。`,
    notes: ["配置 Tavily", "web search / web fetch", "答案保留来源"],
  },
  {
    id: "drawing",
    title: "Drawing 图片生成",
    duration: 69.6,
    video: "assets/6_imggenrate_kf.mp4",
    overlay: "把图片生成接口也收进同一个工作台",
    text: `下面是 Drawing 页面。

这个页面主要用来调用兼容的图片生成接口。先选择已经保存的 Provider，再选择对应的图片模型。

然后输入提示词。需要参考图的时候，也可以把参考图片一起加进去。

点击生成以后，任务会发送给对应的图片接口。生成完成的结果会保存在本地记录里。

后面要重新查看、打开图片，或者找到生成文件，都可以直接从这里进。

这里的重点不是把它做成专业画图软件，而是把图片生成接口也放进同一个工作台。

比如你已经保存了一个支持图片生成的 Provider，就可以直接在 Drawing 页面里复用。模型、提示词、参考图和生成结果都在这里形成记录。

如果某个图片模型临时不可用，也可以换另一个 Provider 测试，不需要去翻一堆分散的配置文件。

它不是视频里最复杂的功能，但放在一起管理会比较省事：文本模型、视觉模型、搜索工具、图片生成接口，都可以围绕同一套 Provider 和本地记录来组织。`,
    notes: ["Provider / Model / Prompt", "支持参考图", "结果保存在本地记录"],
  },
  {
    id: "sessions",
    title: "Talking、Sessions 和 Handoff",
    duration: 85.966667,
    video: "assets/7_session_kf.mp4",
    overlay: "测试 Provider，也整理本地会话",
    text: `除了给 Agent 写配置，Codex Switch 里还有一个简单的 Talking 页面。

这里可以直接选择已经保存的 Provider 和模型，做一次快速对话测试。也可以添加文件或者图片，不过实际支持哪些输入，还是取决于当前选择的模型。

如果只是想确认某个 Provider 能不能正常调用，这个页面会比重新启动 Agent 更快。

再看 Sessions。

Codex Switch 会读取这些 Agent 保存在本机的会话记录，并集中显示出来。

打开一条会话，可以查看 transcript，也就是之前的对话和操作内容。

如果要继续原来的任务，可以复制恢复命令，在终端里重新打开对应会话。

这里还可以生成 Handoff，把当前任务的重要上下文整理出来。

Handoff 不是把整个会话复制一遍，而是把下一段工作最需要知道的内容提炼出来。

比如当前做到哪一步，改了哪些文件，接下来要验证什么，还有哪些风险没有处理。

需要切换到另一个会话，或者换一个 Agent 继续处理时，就不用从头解释一遍。

这个功能对长任务比较有用。因为真正做项目的时候，很多上下文不是一句“继续刚才的工作”就能说清楚的。`,
    notes: ["Talking 快速测试模型", "Sessions 查看 transcript", "Handoff 交接上下文"],
  },
  {
    id: "settings",
    title: "Settings、其他 Agent 和下载",
    duration: 74.7,
    video: "assets/8_setting_github_kf.mp4",
    overlay: "Codex、Claude Code、Gemini 分开管理",
    text: `最后看一下 Settings。

这里可以设置不同 Agent 的安装目录、默认工作区和终端程序，也可以修改界面语言和主题。

Codex、Claude Code 和 Gemini 在这里是分开管理的。因为它们的配置写法和支持的协议并不完全一样，所以选择 Codex，就写 Codex 的配置；选择 Claude Code 或 Gemini，就按各自的格式来写。

这次完整演示的是把 DeepSeek 接入 Codex。视频里出现 Gemini 配置，只是说明它也可以在应用中管理，不是说 DeepSeek 可以直接接入 Gemini。

简单总结一下：统一配置只是其中一部分。更重要的是，有些模型原本接不进 Codex，这里可以帮它转换协议；有些模型只能处理文字，也可以额外接上识图和搜索工具。

Windows 版本可以从 GitHub Releases 下载。使用时遇到问题，或者觉得哪个功能还可以改，都可以到 GitHub 提 Issue。项目如果刚好对你有用，也可以顺手点个 Star。

那这期就先到这里，感谢大家看到最后。`,
    notes: ["目录 / 终端 / 工作区", "不同 Agent 分开写配置", "GitHub Releases 下载"],
  },
];

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: false, ...opts });
  if (result.status !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} failed with exit ${result.status}`);
  }
}

function capture(cmd, args) {
  const result = spawnSync(cmd, args, { encoding: "utf8", shell: false });
  if (result.status !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} failed: ${result.stderr}`);
  }
  return result.stdout.trim();
}

function fmt(n) {
  return Number(n).toFixed(3).replace(/\.?0+$/, "");
}

function esc(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function splitCaptions(text) {
  const plain = text.replace(/\r\n/g, "\n").replace(/\n+/g, "\n").trim();
  const sentences = plain
    .split(/(?<=[。！？?])/)
    .map((s) => s.trim())
    .filter(Boolean);
  const chunks = [];
  for (const sentence of sentences) {
    if (sentence.length <= 24) {
      chunks.push(sentence);
      continue;
    }
    let current = "";
    for (const part of sentence.split(/(?<=[，、：；])/)) {
      if (current && (current + part).length > 24) {
        chunks.push(current);
        current = part;
      } else {
        current += part;
      }
    }
    if (current) chunks.push(current);
  }
  return chunks;
}

function atempoFilter(factor) {
  const parts = [];
  let value = factor;
  while (value < 0.5) {
    parts.push(0.5);
    value /= 0.5;
  }
  while (value > 2) {
    parts.push(2);
    value /= 2;
  }
  parts.push(value);
  return parts.map((v) => `atempo=${v.toFixed(6)}`).join(",");
}

fs.mkdirSync(ttsDir, { recursive: true });

const md = [
  "# Codex Switch 中文旁白 v2",
  "",
  "原则：以完整录屏为主线，旁白按录屏段落重新贴合；解释层只做补充，不重复录屏画面。",
  "",
  ...segments.flatMap((segment, index) => [
    `## ${String(index + 1).padStart(2, "0")} ${segment.title}`,
    "",
    segment.text.trim(),
    "",
  ]),
].join("\n");
fs.writeFileSync(narrationMd, md, "utf8");

const concatList = [];
for (const [index, segment] of segments.entries()) {
  const stem = `${String(index + 1).padStart(2, "0")}-${segment.id}`;
  const textPath = path.join(ttsDir, `${stem}.txt`);
  const rawWav = path.join(ttsDir, `${stem}.raw.wav`);
  const finalWav = path.join(ttsDir, `${stem}.wav`);
  fs.writeFileSync(textPath, segment.text.replace(/\n+/g, "\n").trim(), "utf8");

  console.log(`Generating TTS ${stem}`);
  run("py", [engine, "--text", segment.text.replace(/\n+/g, "\n").trim(), "--voice", "xiaoyi_lively", "--output", rawWav]);

  const rawDuration = Number(capture("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", rawWav]));
  const factor = rawDuration / segment.duration;
  const filter = `${atempoFilter(factor)},apad,atrim=0:${fmt(segment.duration)},asetpts=N/SR/TB`;
  console.log(`Retiming ${stem}: ${rawDuration.toFixed(3)}s -> ${segment.duration.toFixed(3)}s`);
  run("ffmpeg", ["-y", "-i", rawWav, "-filter:a", filter, "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", finalWav]);
  concatList.push(`file '${finalWav.replace(/'/g, "'\\''")}'`);
}

const concatPath = path.join(ttsDir, "concat-v2.txt");
fs.writeFileSync(concatPath, concatList.join("\n"), "utf8");
run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", concatPath, "-c", "copy", narrationOut]);

let cursor = 0;
for (const segment of segments) {
  segment.start = cursor;
  cursor += segment.duration;
}
const totalDuration = cursor;

const subtitles = [];
for (const segment of segments) {
  const chunks = splitCaptions(segment.text);
  const totalChars = chunks.reduce((sum, chunk) => sum + chunk.length, 0) || 1;
  const gap = 0.05;
  const available = segment.duration - gap * Math.max(0, chunks.length - 1);
  let t = segment.start;
  for (const [index, chunk] of chunks.entries()) {
    const rawDuration = Math.max(0.5, available * (chunk.length / totalChars));
    const segmentEnd = segment.start + segment.duration;
    const duration = Math.max(0.35, Math.min(rawDuration, segmentEnd - t - 0.04));
    subtitles.push({ start: t, duration, text: chunk });
    t += duration + (index < chunks.length - 1 ? gap : 0);
  }
}

const videoHtml = segments
  .filter((segment) => segment.video)
  .map((segment, index) => `      <div id="w-${segment.id}" class="video-wrap ${index % 2 ? "app-window" : "screen-window"}" data-layout-allow-overflow>
        <video id="video-${segment.id}" class="clip" data-start="${fmt(segment.start)}" data-duration="${fmt(segment.duration)}" data-media-start="0" data-track-index="${2 + (index % 6)}" src="${segment.video}" muted playsinline></video>
      </div>`)
  .join("\n\n");

const overlayHtml = segments
  .map((segment, index) => {
    const noteItems = segment.notes.map((note) => `<li>${esc(note)}</li>`).join("");
    if (segment.id === "protocol") {
      return `      <section id="protocol" class="protocol clip" data-start="${fmt(segment.start)}" data-duration="${fmt(segment.duration)}" data-track-index="30" data-layout-ignore>
        <div class="protocol-kicker">LOCAL PROXY</div>
        <h2>请求不是直接发给 DeepSeek</h2>
        <div class="protocol-flow">
          <div id="node-codex" class="flow-node"><strong>Codex</strong><span>Responses API</span></div>
          <div id="node-proxy" class="flow-node local"><strong>127.0.0.1:47632</strong><span>translate request / response</span></div>
          <div id="node-deepseek" class="flow-node"><strong>DeepSeek</strong><span>Chat Completions</span></div>
          <div id="flow-line-a" class="flow-line a"></div>
          <div id="flow-line-b" class="flow-line b"></div>
        </div>
        <p>Wire format 决定本地代理应该选择哪条转换路径。</p>
      </section>`;
    }
    return `      <section id="ov-${segment.id}" class="overlay-panel clip" data-start="${fmt(segment.start)}" data-duration="${fmt(Math.min(14, segment.duration))}" data-track-index="${40 + index}">
        <div class="overlay-count">${String(index + 1).padStart(2, "0")}</div>
        <div>
          <h2>${esc(segment.title)}</h2>
          <p>${esc(segment.overlay)}</p>
          <ul>${noteItems}</ul>
        </div>
      </section>`;
  })
  .join("\n\n");

const subtitleHtml = subtitles
  .map((item, index) => `      <div id="sub-${String(index + 1).padStart(3, "0")}" class="subtitle clip" data-start="${fmt(item.start)}" data-duration="${fmt(item.duration)}" data-track-index="90">${esc(item.text)}</div>`)
  .join("\n");

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Codex Switch v2</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Inter:wght@500;650;750;850&family=JetBrains+Mono:wght@500;700&display=swap");

      * { box-sizing: border-box; }
      html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #111411; color: #f8f8f3; font-family: Inter, "Microsoft YaHei", sans-serif; }
      #root { position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #111411; }

      .video-wrap {
        position: absolute;
        inset: 0;
        z-index: 10;
        overflow: hidden;
        background: #111411;
      }

      .video-wrap video { width: 100%; height: 100%; object-fit: cover; }
      .video-wrap.screen-window video { transform: scale(1.03); }
      .video-wrap.app-window video { transform: scale(1.08); }

      .overlay-panel {
        position: absolute;
        left: 58px;
        top: 54px;
        z-index: 45;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 22px;
        width: 760px;
        padding: 20px 24px 22px;
        border: 1px solid rgba(248, 248, 243, 0.28);
        background: rgba(18, 22, 19, 0.72);
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34);
        backdrop-filter: blur(14px);
      }

      .overlay-count {
        width: 74px;
        height: 74px;
        display: grid;
        place-items: center;
        border: 2px solid #68b53f;
        color: #b6f07b;
        font-family: "JetBrains Mono", monospace;
        font-size: 30px;
        font-weight: 700;
      }

      .overlay-panel h2 {
        margin: 0;
        color: #f8f8f3;
        font-size: 42px;
        line-height: 1.08;
        letter-spacing: -0.035em;
      }

      .overlay-panel p {
        margin: 10px 0 13px;
        color: #cfd6ce;
        font-size: 22px;
        line-height: 1.35;
      }

      .overlay-panel ul {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .overlay-panel li {
        padding: 7px 10px;
        border: 1px solid rgba(248, 248, 243, 0.22);
        background: rgba(248, 248, 243, 0.08);
        color: #eef2ec;
        font-family: "JetBrains Mono", monospace;
        font-size: 16px;
      }

      .protocol {
        position: absolute;
        inset: 0;
        z-index: 35;
        padding: 72px 94px;
        background:
          radial-gradient(circle at 50% 48%, rgba(104, 181, 63, 0.18), transparent 31%),
          linear-gradient(135deg, #151816 0%, #222820 100%);
      }

      .protocol-kicker {
        color: #b6f07b;
        font-family: "JetBrains Mono", monospace;
        font-size: 26px;
        letter-spacing: 0.08em;
      }

      .protocol h2 {
        margin: 14px 0 72px;
        max-width: 1120px;
        font-size: 82px;
        line-height: 1;
        letter-spacing: -0.055em;
      }

      .protocol-flow {
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1.25fr 1fr;
        gap: 90px;
        align-items: center;
      }

      .flow-node {
        min-height: 230px;
        padding: 32px;
        border: 2px solid rgba(248, 248, 243, 0.52);
        background: rgba(8, 10, 9, 0.88);
        box-shadow: 0 28px 72px rgba(0, 0, 0, 0.28);
      }

      .flow-node.local { border-color: #68b53f; background: rgba(18, 32, 18, 0.94); }
      .flow-node strong { display: block; font-size: 40px; letter-spacing: -0.035em; }
      .flow-node span { display: block; margin-top: 48px; color: #d8dfd5; font-family: "JetBrains Mono", monospace; font-size: 23px; line-height: 1.45; }
      .flow-line { position: absolute; top: 50%; height: 4px; background: #b6f07b; transform-origin: left center; }
      .flow-line.a { left: 28%; width: 17%; }
      .flow-line.b { left: 55%; width: 17%; }
      .protocol p { position: absolute; left: 94px; bottom: 74px; margin: 0; color: #d8dfd5; font-size: 32px; }

      .subtitle {
        position: absolute;
        left: 50%;
        bottom: 52px;
        z-index: 95;
        max-width: 1360px;
        padding: 15px 24px 17px;
        transform: translateX(-50%);
        border: 1px solid rgba(247, 248, 244, 0.38);
        background: rgba(15, 17, 15, 0.78);
        color: #f8f8f3;
        font-size: 38px;
        font-weight: 750;
        line-height: 1.28;
        text-align: center;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.36);
      }
    </style>
  </head>
  <body>
    <div id="root" class="clip" data-composition-id="main" data-width="1920" data-height="1080" data-start="0" data-duration="${fmt(totalDuration)}">
      <audio id="narration" class="clip" data-start="0" data-duration="${fmt(totalDuration)}" data-track-index="0" src="assets/narration-v2.wav"></audio>

${videoHtml}

${overlayHtml}

      <div id="subtitles" data-layout-allow-overflow>
${subtitleHtml}
      </div>
    </div>

    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });

      function enter(target, at, fromVars, duration = 0.55, ease = "power3.out") {
        tl.fromTo(target, { ...fromVars }, { x: 0, y: 0, scale: 1, opacity: 1, filter: "blur(0px)", duration, ease }, at);
      }

      ${segments
        .filter((segment) => segment.video)
        .map((segment) => `enter("#w-${segment.id}", ${fmt(segment.start + 0.08)}, { opacity: 0, scale: 1.035, filter: "blur(10px)" }, 0.5, "power3.out");`)
        .join("\n      ")}

      ${segments
        .filter((segment) => segment.id !== "protocol")
        .map((segment) => {
          const at = segment.start + 0.55;
          return [
            `enter("#ov-${segment.id}", ${fmt(at)}, { x: -70, opacity: 0, filter: "blur(8px)" }, 0.56, "expo.out");`,
            `tl.to("#ov-${segment.id}", { opacity: 0, y: -16, duration: 0.36, ease: "power2.in" }, ${fmt(segment.start + Math.min(14, segment.duration) - 0.5)});`,
          ].join("\n      ");
        })
        .join("\n      ")}

      enter("#protocol .protocol-kicker", ${fmt(segments[3].start + 0.15)}, { y: -24, opacity: 0 }, 0.42, "circ.out");
      enter("#protocol h2", ${fmt(segments[3].start + 0.35)}, { x: -90, opacity: 0, filter: "blur(10px)" }, 0.68, "expo.out");
      enter("#node-codex", ${fmt(segments[3].start + 1.35)}, { x: -120, opacity: 0 }, 0.62, "expo.out");
      enter("#node-proxy", ${fmt(segments[3].start + 1.65)}, { scale: 0.82, opacity: 0 }, 0.72, "back.out(1.35)");
      enter("#node-deepseek", ${fmt(segments[3].start + 1.95)}, { x: 120, opacity: 0 }, 0.62, "expo.out");
      tl.fromTo("#flow-line-a", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power3.inOut" }, ${fmt(segments[3].start + 2.6)});
      tl.fromTo("#flow-line-b", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power3.inOut" }, ${fmt(segments[3].start + 3.05)});
      enter("#protocol p", ${fmt(segments[3].start + 3.65)}, { y: 28, opacity: 0 }, 0.46, "circ.out");

      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;

fs.writeFileSync(indexPath, html, "utf8");
console.log(`Built v2 composition: ${fmt(totalDuration)}s`);
