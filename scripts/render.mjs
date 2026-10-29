import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const dataPath = path.join(root, "data", "index.json");
const readmePath = path.join(root, "README.md");

const SECTIONS = ["AI 安全与红队工具", "DeepSeek Harness 插件生态", "代码审计与安全学习", "我的项目"];

const entries = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const short = (text, limit = 96) => {
  const value = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!value) return "—";
  return value.length > limit ? value.slice(0, limit - 1).trimEnd() + "…" : value;
};

const table = (rows) => {
  if (!rows.length) return "_暂无条目_";
  const head = ["项目", "★", "语言", "简介"];
  const lines = ["| " + head.join(" | ") + " |", "| " + head.map(() => "---").join(" | ") + " |"];
  for (const entry of rows) {
    const link = "[" + entry.name + "](" + entry.url + ")";
    const desc = entry.note || short(entry.desc);
    lines.push("| " + [link, entry.stars, entry.lang || "—", short(desc)].join(" | ") + " |");
  }
  return lines.join("\n");
};

let readme = fs.readFileSync(readmePath, "utf8");
for (const section of SECTIONS) {
  const rows = entries.filter((e) => e.section === section).sort((a, b) => b.stars - a.stars);
  const start = "<!-- INDEX:START " + section + " -->";
  const end = "<!-- INDEX:END " + section + " -->";
  const head = readme.indexOf(start);
  const tail = readme.indexOf(end);
  if (head < 0 || tail < 0) {
    console.warn("missing markers for section: " + section);
    continue;
  }
  readme = readme.slice(0, head + start.length) + "\n" + table(rows) + "\n" + readme.slice(tail);
}
// 保持 README 顶部的 entries 徽章与 data/index.json 条数一致，避免手动增删后徽章漂移。
const badge = /(!\[entries\]\(https:\/\/img\.shields\.io\/badge\/entries-)(\d+)(-)/;
readme = readme.replace(badge, (m, pre, count, post) => pre + entries.length + post);
if (!badge.test(readme)) console.warn("entries badge not found in README");
fs.writeFileSync(readmePath, readme);
console.log("rendered " + entries.length + " entries into " + SECTIONS.length + " sections");
