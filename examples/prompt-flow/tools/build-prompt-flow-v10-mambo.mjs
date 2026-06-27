// Build the prompt-flow demo video (v9).
//
// What changed vs v8:
//  - CORRECTED DIRECTION. v8 sold prompt-flow as "a hotkey for your prompts".
//    That buried the actual point. The real value is Flow: you queue a multi-step
//    prompt sequence once and it runs UNATTENDED. A hook waits for each answer to
//    finish, then auto-sends the next step, so it never interrupts the model the
//    way pasting everything at once would. And it keeps running while you do other
//    things / switch windows — as long as the CLI window isn't closed.
//  - SCRIPT STYLE rewritten to imitate the casual, first-person, demo-driven voice
//    of two reference creator subtitles (personal anecdote -> "我找到个小工具" ->
//    "说再多不如直接看" -> "你看…" -> casual close).
//  - TTS via the "manbo" engine (multi-edge-tts-cn engine.py, named voices) instead
//    of calling edge-tts directly. Voice: xiaoxiao_lively (lively, daily-conversation).
//    Still NO atempo time-stretch — scene timing follows the real audio length.
//
// Usage:  node examples/prompt-flow/tools/build-prompt-flow-v10-mambo.mjs
//         SKIP_TTS=1 node examples/prompt-flow/tools/build-prompt-flow-v10-mambo.mjs
//         (reuse existing audio)
// Tools:  @systiger/mambo-tts / edge-tts converter, ffmpeg, ffprobe

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const exampleDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectDir = path.resolve(exampleDir, "../..");
const indexPath = path.join(projectDir, "index.html");
const assetPrefix = "examples/prompt-flow/assets";
const assetsDir = path.join(exampleDir, "assets");
const ttsDir = path.join(assetsDir, "tts-v10");
const narrationWav = path.join(assetsDir, "prompt-flow-v10-narration.wav");
const narrationTxt = path.join(assetsDir, "prompt-flow-v10-narration.txt");

// Genuine 曼波 voice from the @systiger/mambo-tts ClawHub skill: zh-CN-XiaoyiNeural + pitch +8%.
// It calls the sibling edge-tts skill's tts-converter.js directly so we can pin an output path.
const MAMBO_TTS = process.env.MAMBO_TTS_CONVERTER ||
  "C:/Users/TT/.openclaw/workspace/skills/edge-tts/scripts/tts-converter.js";
const MAMBO_VOICE = "zh-CN-XiaoyiNeural";
const MAMBO_PITCH = "+8%";

// --- Footage (the real proof) -------------------------------------------------
const codexVideo = `${assetPrefix}/codex-flow.mp4`; // 1128x916, ~18.9s
const claudeVideo = `${assetPrefix}/claude-flow.mp4`; // 1128x916, ~12.1s
const CLAUDE_FOOTAGE = 12.16;

// --- Narration ----------------------------------------------------------------
// Casual, first-person, demo-driven — imitating the reference creator subtitles.
// Each segment is one scene. `hold` is extra time after speech; `cap` clamps to footage.
const segments = [
  {
    id: "pain",
    kind: "pain",
    text: "用 Codex 或者 Claude Code 干点稍微复杂的活，经常是好几步：先改代码，再跑测试，最后让它提交。麻烦的是，每一步你都得守着——发一条，等它答完，再发下一条。",
    hold: 0.5,
  },
  {
    id: "turn",
    kind: "turn",
    text: "你可能会想，那我一次把几步全发过去不就完了？可那样会直接打断它正在写的回答，全乱。后来我用上一个小工具，叫 prompt-flow，它的 Flow 模式就是专门解决这个的。",
    hold: 0.5,
  },
  {
    id: "how",
    kind: "how",
    text: "做法很聪明：你把这几步提示词按顺序排好，按 Ctrl、Alt、P 选中这条 Flow。它会等当前这条回答彻底结束，再自动发下一条，全程不打断。",
    hold: 0.55,
  },
  {
    id: "codex",
    kind: "demo",
    label: "CODEX · FLOW",
    video: codexVideo,
    text: "说再多不如直接看。你看，选一次它就自己往下跑了。这时候你完全可以走开，去刷个网页、切到别的窗口，只要别把它关掉，它就一直接着发。这是 Codex。",
    hold: 0.7,
  },
  {
    id: "claude",
    kind: "demo",
    label: "CLAUDE CODE · FLOW",
    video: claudeVideo,
    text: "换成 Claude Code 也一样。一条 Flow 设好，多步任务自己跑完，你回来直接看结果就行。值得试试。",
    hold: 2.2,
    cap: CLAUDE_FOOTAGE - 0.05,
    endcard: true,
  },
];

// --- helpers ------------------------------------------------------------------
function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: false });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} -> exit ${r.status}`);
}
function capture(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8", shell: false });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed: ${r.stderr}`);
  return r.stdout.trim();
}
function fmt(n) {
  return Number(n).toFixed(3).replace(/\.?0+$/, "");
}
function esc(v) {
  return String(v)
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
    if (sentence.length <= 22) {
      chunks.push(sentence);
      continue;
    }
    let cur = "";
    for (const part of sentence.split(/(?<=[，、：；—])/)) {
      if (cur && (cur + part).length > 22) {
        chunks.push(cur);
        cur = part;
      } else {
        cur += part;
      }
    }
    if (cur) chunks.push(cur);
  }
  return chunks;
}

// --- 1. TTS per segment via manbo (natural pace, no time-stretch) --------------
fs.mkdirSync(ttsDir, { recursive: true });
const concatList = [];
for (const [i, seg] of segments.entries()) {
  const stem = `${String(i + 1).padStart(2, "0")}-${seg.id}`;
  const manboMp3 = path.join(ttsDir, `${stem}.mambo.mp3`);
  const rawWav = path.join(ttsDir, `${stem}.raw.wav`);
  const finalWav = path.join(ttsDir, `${stem}.wav`);

  if (process.env.SKIP_TTS && fs.existsSync(rawWav)) {
    console.log(`TTS ${stem} (reuse)`);
  } else {
    console.log(`TTS ${stem} (mambo ${MAMBO_VOICE} ${MAMBO_PITCH})`);
    run("node", [MAMBO_TTS, seg.text, "--voice", MAMBO_VOICE, "--pitch", MAMBO_PITCH, "--output", manboMp3]);
    // mambo writes 24k mono mp3; normalize to stereo 48k pcm for the rest of the pipeline.
    run("ffmpeg", ["-y", "-loglevel", "error", "-i", manboMp3, "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", rawWav]);
  }

  const speech = Number(capture("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", rawWav]));
  let duration = speech + seg.hold;
  if (seg.cap) duration = Math.min(duration, seg.cap);
  seg.speech = speech;
  seg.duration = duration;

  // pad the natural speech with trailing silence up to the scene duration.
  run("ffmpeg", ["-y", "-loglevel", "error", "-i", rawWav, "-filter:a", `apad,atrim=0:${fmt(duration)},asetpts=N/SR/TB`, "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", finalWav]);
  concatList.push(`file '${finalWav.replace(/'/g, "'\\''")}'`);
}

const concatPath = path.join(ttsDir, "concat-v9.txt");
fs.writeFileSync(concatPath, concatList.join("\n"), "utf8");
run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", concatPath, "-c", "copy", narrationWav]);

// timeline
let cursor = 0;
for (const seg of segments) {
  seg.start = cursor;
  cursor += seg.duration;
}
const total = cursor;

// narration text file for review
fs.writeFileSync(
  narrationTxt,
  segments.map((s, i) => `${String(i + 1).padStart(2, "0")} [${fmt(s.start)}-${fmt(s.start + s.duration)}] ${s.text}`).join("\n") + "\n",
  "utf8",
);

// --- 2. subtitles (timed to actual speech within each scene) ------------------
const subtitles = [];
for (const seg of segments) {
  const chunks = splitCaptions(seg.text);
  const totalChars = chunks.reduce((a, c) => a + c.length, 0) || 1;
  const gap = 0.04;
  const speakEnd = seg.start + seg.speech;
  const available = seg.speech - gap * Math.max(0, chunks.length - 1);
  let t = seg.start;
  for (const [i, chunk] of chunks.entries()) {
    const raw = Math.max(0.6, available * (chunk.length / totalChars));
    const dur = Math.max(0.4, Math.min(raw, speakEnd - t - 0.03));
    if (dur <= 0.1) break;
    subtitles.push({ start: t, duration: dur, text: chunk });
    t += dur + (i < chunks.length - 1 ? gap : 0);
  }
}

// =============================================================================
// 3. Composition
// =============================================================================
const A = []; // GSAP statements (absolute times)
const push = (s) => A.push(s);
const seg = (id) => segments.find((s) => s.id === id);

const pain = seg("pain");
const turn = seg("turn");
const how = seg("how");
const codex = seg("codex");
const claude = seg("claude");

// ---- scene markup ----
function sceneOpen(id, s, extra = "") {
  return `      <section id="scene-${id}" class="scene clip" data-start="${fmt(s.start)}" data-duration="${fmt(s.duration)}" data-track-index="${10 + segments.indexOf(s)}"${extra}>`;
}

// scene 1: the babysitting — multi-step task, you wait between every step
const painHtml = `${sceneOpen("pain", pain)}
        <div class="kicker">THE BABYSITTING</div>
        <h1 class="headline">多步任务，<br/>只能一步步盯着发。</h1>
        <div class="steps">
          <div class="step s1"><b>01</b><div><strong>改这段代码</strong><i>↵ 发送</i></div></div>
          <div class="wait w1">⌛ 等它写完…</div>
          <div class="step s2"><b>02</b><div><strong>补上单元测试</strong><i>↵ 发送</i></div></div>
          <div class="wait w2">⌛ 又得等…</div>
          <div class="step s3"><b>03</b><div><strong>提交并说明</strong></div></div>
          <div class="babysit">得一直守着</div>
        </div>
      </section>`;

// scene 2: the catch + the fix — pasting all at once interrupts; Flow queues
const turnHtml = `${sceneOpen("turn", turn)}
        <div class="kicker">THE FIX</div>
        <h1 class="headline">与其打断它，<br/>不如让 Flow 排队。</h1>
        <div class="contrast">
          <div class="bad">
            <div class="bad-head">一次全发</div>
            <div class="bad-body">step1 step2<br/>step3 step4…</div>
            <div class="bad-x">✕ 打断回答</div>
          </div>
          <div class="arrow">→</div>
          <div class="good">
            <div class="good-tab">Flow</div>
            <div class="good-body">排好队<br/>挨个发</div>
            <div class="good-ok">✓ 不打断</div>
          </div>
        </div>
      </section>`;

// scene 3: how — pick the Flow, it waits for each answer then sends the next
const howHtml = `${sceneOpen("how", how)}
        <div class="kicker">PROMPT · FLOW</div>
        <h2 class="headline sm">等它答完，<br/>再自动发下一条。</h2>
        <div class="picker">
          <div class="picker-head"><strong>prompt-flow</strong>
            <div class="tabs"><span class="tab">Prompt</span><span class="tab active">Flow</span></div>
          </div>
          <div class="search">Ctrl + Alt + P　·　选一条 Flow</div>
          <div class="item active"><strong>修复并测试</strong><span>3 步 · 改代码 → 测试 → 提交</span></div>
          <div class="item"><strong>重构这个模块</strong><span>4 步 · 自动接力</span></div>
        </div>
        <div class="flow-rail">
          <div class="rail-line"><span class="rail-fill"></span></div>
          <div class="node fn1"><b>01</b><strong>发送第一步</strong></div>
          <div class="node fn2"><b>02</b><strong>等回答结束</strong></div>
          <div class="node fn3"><b>03</b><strong>自动发下一步</strong></div>
        </div>
      </section>`;

function demoHtml(id, s) {
  const tip = id === "codex" ? "选一次，自己跑" : "切走，也不断";
  const away = id === "codex" ? "↗ 切到别的窗口，照样在跑" : "✓ 回来直接看结果";
  return `${sceneOpen(id, s)}
        <div class="demo-left">
          <div class="kicker">${id === "codex" ? "CODEX" : "CLAUDE CODE"}</div>
          <h2 class="headline sm">${tip}</h2>
          <ul class="track" id="track-${id}">
            <li class="trk"><span class="tdot"></span><div><b>STEP 01</b><i>发送第一步</i></div></li>
            <li class="trk"><span class="tdot"></span><div><b>STEP 02</b><i>等待回答结束</i></div></li>
            <li class="trk"><span class="tdot"></span><div><b>STEP 03</b><i>自动继续</i></div></li>
          </ul>
          <div class="away">${away}</div>
        </div>
        <div class="frame-border"></div>
        <div class="tag">${esc(s.label)}</div>
      </section>`;
}

const codexHtml = demoHtml("codex", codex);
const claudeHtml = demoHtml("claude", claude);

const videosHtml = `      <video id="vid-codex" class="media clip" data-start="${fmt(codex.start)}" data-duration="${fmt(codex.duration)}" data-media-start="0" data-track-index="30" src="${codexVideo}" muted playsinline></video>
      <video id="vid-claude" class="media clip" data-start="${fmt(claude.start)}" data-duration="${fmt(claude.duration)}" data-media-start="0" data-track-index="31" src="${claudeVideo}" muted playsinline></video>`;

// end card lives inside the claude scene window
const endStart = claude.start + claude.speech + 0.15;
const endcardHtml = `      <section id="endcard" class="endcard clip" data-start="${fmt(endStart)}" data-duration="${fmt(claude.start + claude.duration - endStart)}" data-track-index="60" data-layout-ignore>
        <div class="end-inner">
          <div class="kicker">prompt-flow</div>
          <h1 class="end-title">多步任务，<br/>设好一次，自己跑完。</h1>
          <div class="end-keys"><span>Ctrl</span><span>Alt</span><span>P</span></div>
          <p class="end-sub">Codex · Claude Code　·　github.com/baosen-h/prompt-flow</p>
        </div>
      </section>`;

const subtitleHtml = subtitles
  .map((it, i) => `      <div id="sub-${String(i + 1).padStart(3, "0")}" class="subtitle clip" data-start="${fmt(it.start)}" data-duration="${fmt(it.duration)}" data-track-index="90">${esc(it.text)}</div>`)
  .join("\n");

const progressHtml = `      <div id="progress" class="progress clip" data-start="0" data-duration="${fmt(total)}" data-track-index="95" data-layout-ignore><span class="bar"></span></div>`;

// ---- animations ----
// scene 1: pain (babysitting steps appear, "wait" beats pulse, babysit stamp)
push(`tl.from("#scene-pain .kicker", { x: -36, opacity: 0, duration: 0.34, ease: "power3.out" }, ${fmt(pain.start + 0.12)});`);
push(`tl.from("#scene-pain .headline", { y: 50, opacity: 0, duration: 0.6, ease: "expo.out" }, ${fmt(pain.start + 0.28)});`);
push(`tl.from("#scene-pain .step", { x: 60, opacity: 0, duration: 0.4, stagger: 0.5, ease: "power3.out" }, ${fmt(pain.start + 0.95)});`);
push(`tl.fromTo("#scene-pain .wait", { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.5 }, ${fmt(pain.start + 1.35)});`);
push(`tl.to("#scene-pain .wait", { opacity: 0.35, duration: 0.45, yoyo: true, repeat: 3, ease: "sine.inOut" }, ${fmt(pain.start + 1.8)});`);
push(`tl.fromTo("#scene-pain .babysit", { scale: 0.6, opacity: 0, rotate: -12 }, { scale: 1, opacity: 1, rotate: -6, duration: 0.4, ease: "back.out(2)" }, ${fmt(pain.start + 3.0)});`);

// scene 2: turn (bad card -> X, arrow, good Flow card -> check)
push(`tl.from("#scene-turn .kicker", { x: -30, opacity: 0, duration: 0.3, ease: "power3.out" }, ${fmt(turn.start + 0.1)});`);
push(`tl.from("#scene-turn .headline", { y: 46, opacity: 0, duration: 0.58, ease: "expo.out" }, ${fmt(turn.start + 0.24)});`);
push(`tl.fromTo("#scene-turn .bad", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, ${fmt(turn.start + 1.0)});`);
push(`tl.fromTo("#scene-turn .bad-x", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.34, ease: "back.out(2)" }, ${fmt(turn.start + 1.7)});`);
push(`tl.fromTo("#scene-turn .arrow", { x: -10, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3 }, ${fmt(turn.start + 2.1)});`);
push(`tl.fromTo("#scene-turn .good", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "back.out(1.4)" }, ${fmt(turn.start + 2.35)});`);
push(`tl.fromTo("#scene-turn .good-ok", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.34, ease: "back.out(2)" }, ${fmt(turn.start + 3.0)});`);

// scene 3: how (picker slides in, Flow items, rail fills step by step)
push(`tl.from("#scene-how .kicker", { x: -30, opacity: 0, duration: 0.3, ease: "power3.out" }, ${fmt(how.start + 0.1)});`);
push(`tl.from("#scene-how .headline", { y: 44, opacity: 0, duration: 0.55, ease: "expo.out" }, ${fmt(how.start + 0.24)});`);
push(`tl.fromTo("#scene-how .picker", { x: 70, opacity: 0, scale: 0.96 }, { x: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }, ${fmt(how.start + 0.9)});`);
push(`tl.from("#scene-how .item", { x: 24, opacity: 0, duration: 0.32, stagger: 0.12, ease: "power2.out" }, ${fmt(how.start + 1.3)});`);
push(`tl.from("#scene-how .node", { y: 36, opacity: 0, duration: 0.4, stagger: 0.3, ease: "back.out(1.4)" }, ${fmt(how.start + 2.0)});`);
push(`tl.fromTo("#scene-how .rail-fill", { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, ${fmt(how.start + 2.2)});`);

// demo scenes: footage in, copy in, step tracker synced to speech, away badge
for (const d of [codex, claude]) {
  const id = d.id;
  const vid = `#vid-${id}`;
  push(`tl.fromTo("${vid}", { opacity: 0, scale: 1.04, filter: "blur(10px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.55, ease: "power3.out" }, ${fmt(d.start + 0.08)});`);
  push(`tl.from("#scene-${id} .demo-left > *", { x: -44, opacity: 0, duration: 0.46, stagger: 0.1, ease: "expo.out" }, ${fmt(d.start + 0.4)});`);
  push(`tl.fromTo("#scene-${id} .frame-border", { opacity: 0 }, { opacity: 1, duration: 0.4 }, ${fmt(d.start + 0.2)});`);
  push(`tl.fromTo("#scene-${id} .tag", { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.34, ease: "back.out(1.6)" }, ${fmt(d.start + 0.55)});`);
  const span = d.speech;
  const at = [0.3, 0.55, 0.8].map((p) => d.start + span * p);
  at.forEach((t, i) => {
    push(`tl.to("#track-${id} .trk:nth-child(${i + 1})", { opacity: 1, duration: 0.3, ease: "power2.out" }, ${fmt(t)});`);
    push(`tl.to("#track-${id} .trk:nth-child(${i + 1}) .tdot", { backgroundColor: "#5D993E", scale: 1.25, duration: 0.3, ease: "back.out(2)" }, ${fmt(t)});`);
  });
  push(`tl.fromTo("#scene-${id} .away", { opacity: 0 }, { opacity: 1, duration: 0.4 }, ${fmt(d.start + span * 0.5)});`);
}

// end card
push(`tl.to("#vid-claude", { opacity: 0.12, scale: 1.03, duration: 0.6, ease: "sine.in" }, ${fmt(endStart - 0.1)});`);
push(`tl.to("#scene-claude .demo-left, #scene-claude .tag", { opacity: 0, duration: 0.4, ease: "sine.in" }, ${fmt(endStart - 0.1)});`);
push(`tl.fromTo("#endcard .kicker", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }, ${fmt(endStart + 0.1)});`);
push(`tl.fromTo("#endcard .end-title", { y: 40, opacity: 0, filter: "blur(8px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "expo.out" }, ${fmt(endStart + 0.25)});`);
push(`tl.from("#endcard .end-keys span", { scale: 0.7, opacity: 0, duration: 0.32, stagger: 0.1, ease: "back.out(1.9)" }, ${fmt(endStart + 0.7)});`);
push(`tl.fromTo("#endcard .end-sub", { opacity: 0 }, { opacity: 1, duration: 0.5 }, ${fmt(endStart + 1.0)});`);

// progress bar
push(`tl.fromTo("#progress .bar", { scaleX: 0 }, { scaleX: 1, duration: ${fmt(total)}, ease: "none" }, 0);`);

const animScript = A.join("\n      ");

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>prompt-flow demo</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 100%; height: 100%; overflow: hidden;
        background: #F8F8F4; color: #151716; font-family: "Microsoft YaHei", system-ui, sans-serif; }
      #root { position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #F8F8F4; }

      .scene { position: absolute; inset: 0; padding: 84px 104px; background: #F8F8F4; }
      .scene::before { content: ""; position: absolute; inset: 48px; border: 2px solid #D8D9D2; pointer-events: none; }

      .kicker { color: #5D993E; font-family: Consolas, "JetBrains Mono", monospace;
        font-size: 26px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; }

      h1, h2, p { margin: 0; }
      .headline { margin-top: 22px; max-width: 1080px; font-family: "Arial Black", "Microsoft YaHei", sans-serif;
        font-size: 104px; line-height: 1.02; letter-spacing: -0.04em; }
      .headline.sm { font-size: 78px; }

      /* scene 1 - babysitting steps */
      .steps { position: absolute; right: 140px; top: 250px; width: 600px; display: flex; flex-direction: column; gap: 14px; }
      .step { display: flex; align-items: center; gap: 24px; padding: 24px 30px; border: 2px solid #D8D9D2;
        background: #FFFFFF; box-shadow: 12px 12px 0 #E7EEE2; }
      .step b { flex: 0 0 auto; width: 64px; height: 64px; display: grid; place-items: center; background: #151716;
        color: #F8F8F4; font-family: Consolas, monospace; font-size: 34px; font-weight: 700; }
      .step strong { display: block; font-size: 38px; }
      .step i { display: block; margin-top: 6px; color: #5D993E; font-family: Consolas, monospace; font-size: 22px; font-style: normal; }
      .wait { padding-left: 30px; color: #5F625C; font-family: Consolas, monospace; font-size: 30px; }
      .babysit { align-self: flex-end; margin-top: 10px; padding: 12px 22px; background: #151716; color: #F8F8F4;
        font-family: Consolas, monospace; font-size: 30px; font-weight: 700; transform: rotate(-6deg); }

      /* scene 2 - catch + fix */
      .contrast { position: absolute; right: 130px; top: 360px; display: flex; align-items: center; gap: 40px; }
      .bad, .good { width: 320px; padding: 32px 30px; border: 2px solid #D8D9D2; background: #FFFFFF; }
      .bad { box-shadow: 12px 12px 0 #E3E4DD; }
      .bad-head, .good-tab { font-family: Consolas, monospace; font-size: 26px; font-weight: 700; }
      .bad-head { color: #5F625C; }
      .bad-body { margin: 20px 0 24px; color: #9A9E95; font-family: Consolas, monospace; font-size: 30px;
        line-height: 1.4; text-decoration: line-through; }
      .bad-x { display: inline-block; padding: 10px 18px; background: #151716; color: #F8F8F4; font-size: 26px; font-weight: 700; }
      .arrow { font-size: 64px; color: #5D993E; font-weight: 700; }
      .good { border-color: #5D993E; background: #E7EEE2; box-shadow: 12px 12px 0 #CFE0C4; }
      .good-tab { display: inline-block; padding: 6px 16px; background: #5D993E; color: #fff; }
      .good-body { margin: 20px 0 24px; font-size: 32px; font-weight: 800; line-height: 1.4; }
      .good-ok { display: inline-block; padding: 10px 18px; background: #5D993E; color: #fff; font-size: 26px; font-weight: 700; }

      /* scene 3 - how */
      .picker { position: absolute; right: 150px; top: 230px; width: 560px; border: 2px solid #151716;
        background: #191A1B; color: #ECEDE8; box-shadow: 22px 22px 0 #D8D9D2; overflow: hidden; }
      .picker-head { display: flex; justify-content: space-between; align-items: center; padding: 20px 22px;
        border-bottom: 1px solid #353735; font-size: 22px; }
      .tabs { display: flex; gap: 8px; }
      .tab { padding: 8px 16px; border: 1px solid #3E413D; color: #BABCB4; font-size: 18px; }
      .tab.active { border-color: #5D993E; background: #5D993E; color: #fff; }
      .search { margin: 18px 22px 12px; padding: 13px 15px; border: 1px solid #3E413D; color: #D7D9D2;
        font-family: Consolas, monospace; font-size: 19px; }
      .item { margin: 10px 22px; padding: 16px; border: 1px solid #333632; }
      .item.active { border-color: #5D993E; background: rgba(93,153,62,0.18); }
      .item strong { display: block; font-size: 22px; }
      .item span { display: block; margin-top: 6px; color: #A9ADA4; font-size: 17px; }
      .item:last-child { margin-bottom: 22px; }
      .flow-rail { position: absolute; left: 104px; right: 104px; bottom: 178px;
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
      .rail-line { position: absolute; left: 8%; right: 8%; top: 46px; height: 4px; background: #D8D9D2; }
      .rail-fill { display: block; height: 100%; background: #5D993E; transform-origin: left center; }
      .node { position: relative; padding: 28px 30px; border: 2px solid #D8D9D2; background: #FFFFFF;
        box-shadow: 10px 10px 0 #E7EEE2; }
      .node b { display: block; color: #5D993E; font-family: Consolas, monospace; font-size: 40px; }
      .node strong { display: block; margin-top: 14px; font-size: 32px; }

      /* demo scenes */
      .media { position: absolute; left: 742px; top: 96px; width: 1086px; height: 888px;
        z-index: 12; object-fit: contain; background: #0c0e0c; border: 2px solid #151716; }
      .frame-border { position: absolute; left: 742px; top: 96px; width: 1086px; height: 888px; z-index: 13;
        pointer-events: none; box-shadow: 18px 18px 0 #E7EEE2; }
      .demo-left { position: absolute; left: 104px; top: 150px; width: 560px; z-index: 14; }
      .demo-left .headline { margin-top: 18px; }
      .track { list-style: none; margin: 56px 0 0; padding: 0; }
      .trk { display: flex; align-items: center; gap: 22px; padding: 18px 0; opacity: 0.4; }
      .tdot { flex: 0 0 auto; width: 26px; height: 26px; border: 3px solid #5D993E; border-radius: 50%; background: transparent; }
      .trk b { display: block; color: #5D993E; font-family: Consolas, monospace; font-size: 24px; letter-spacing: 0.08em; }
      .trk i { display: block; margin-top: 4px; font-size: 30px; font-style: normal; }
      .away { display: inline-block; margin-top: 40px; padding: 16px 24px; border: 2px solid #5D993E;
        background: #E7EEE2; font-family: Consolas, monospace; font-size: 28px; font-weight: 700; color: #2F5320; }
      .tag { position: absolute; right: 96px; top: 70px; z-index: 16; padding: 12px 18px; background: #5D993E;
        color: #fff; font-family: Consolas, monospace; font-size: 24px; font-weight: 700; }

      /* end card */
      .endcard { position: absolute; inset: 0; z-index: 70; display: grid; place-items: center; background: #F8F8F4; }
      .end-inner { text-align: center; }
      .endcard .kicker { font-size: 30px; letter-spacing: 0.22em; }
      .end-title { margin-top: 28px; font-family: "Arial Black", "Microsoft YaHei", sans-serif; font-size: 96px;
        line-height: 1.05; letter-spacing: -0.04em; }
      .end-keys { display: flex; justify-content: center; gap: 22px; margin-top: 48px; }
      .end-keys span { min-width: 150px; padding: 22px 28px; border: 3px solid #151716; background: #fff;
        box-shadow: 10px 10px 0 #5D993E; font-family: Consolas, monospace; font-size: 48px; font-weight: 700; }
      .end-sub { margin-top: 50px; color: #5F625C; font-family: Consolas, monospace; font-size: 26px; }

      /* subtitle + progress */
      .subtitle { position: absolute; left: 50%; bottom: 70px; z-index: 90; max-width: 1500px;
        padding: 14px 28px 16px; transform: translateX(-50%); background: rgba(248,248,244,0.94);
        border: 1px solid #D8D9D2; color: #151716; font-size: 38px; font-weight: 800; line-height: 1.26; text-align: center; }
      .progress { position: absolute; left: 0; bottom: 0; width: 100%; height: 8px; z-index: 96; background: #E7EEE2; }
      .progress .bar { display: block; width: 100%; height: 100%; background: #5D993E; transform-origin: left center; }
    </style>
  </head>
  <body>
    <div id="root" class="clip" data-composition-id="main" data-width="1920" data-height="1080" data-start="0" data-duration="${fmt(total)}">
      <audio id="narration" class="clip" data-start="0" data-duration="${fmt(total)}" data-track-index="0" src="assets/prompt-flow-v10-narration.wav"></audio>

${painHtml}

${turnHtml}

${howHtml}

${videosHtml}

${codexHtml}

${claudeHtml}

${endcardHtml}

      <div id="subtitles" data-layout-allow-overflow>
${subtitleHtml}
      </div>

${progressHtml}
    </div>

    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });

      ${animScript}

      window.__timelines.main = tl;
    </script>
  </body>
</html>
`;

fs.writeFileSync(indexPath, html, "utf8");
console.log(`\nBuilt prompt-flow v10 (mambo): ${fmt(total)}s, ${subtitles.length} subtitle chunks`);
for (const s of segments) console.log(`  ${s.id.padEnd(8)} start=${fmt(s.start).padStart(7)} speech=${fmt(s.speech).padStart(6)} dur=${fmt(s.duration).padStart(6)}`);
