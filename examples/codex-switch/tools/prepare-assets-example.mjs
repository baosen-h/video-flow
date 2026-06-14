import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const exampleDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectDir = path.resolve(exampleDir, "../..");
const exampleAssetPrefix = "examples/codex-switch/assets";
const assetsDir = path.join(exampleDir, "assets");
const indexPath = path.join(projectDir, "index.html");

const sources = [
  "1_get_deepseek_api.mp4",
  "2_config_provider_agent.mp4",
  "3_test_deepseek_incodex.mp4",
  "4_vision.mp4",
  "5_websearch.mp4",
  "6_imggenrate.mp4",
  "7_session.mp4",
  "8_setting_github.mp4",
];

for (const file of sources) {
  const input = path.join(assetsDir, file);
  const output = path.join(assetsDir, file.replace(/\.mp4$/, "_kf.mp4"));
  if (fs.existsSync(output)) {
    console.log(`exists ${path.basename(output)}`);
    continue;
  }
  console.log(`encoding ${file}`);
  const result = spawnSync("ffmpeg", [
    "-y",
    "-i", input,
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "18",
    "-r", "30",
    "-g", "30",
    "-keyint_min", "30",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    "-an",
    output,
  ], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, "utf8");
  for (const file of sources) {
    html = html
      .split(`${exampleAssetPrefix}/${file}`)
      .join(`${exampleAssetPrefix}/${file.replace(/\.mp4$/, "_kf.mp4")}`)
      .split(`assets/${file}`)
      .join(`${exampleAssetPrefix}/${file.replace(/\.mp4$/, "_kf.mp4")}`);
  }
  fs.writeFileSync(indexPath, html);
  console.log("Updated index.html to use *_kf.mp4 assets");
} else {
  console.log("No root index.html found; run npm run example:build to generate it.");
}
