import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const dataPath = path.join(root, "data", "index.json");
const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? "";
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "awesome-index-refresher",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(token ? { Authorization: "Bearer " + token } : {}),
};

const entries = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let changed = 0;
let failed = 0;

for (let i = 0; i < entries.length; i += 4) {
  const batch = entries.slice(i, i + 4);
  await Promise.all(
    batch.map(async (entry) => {
      try {
        const res = await fetch("https://api.github.com/repos/" + entry.owner + "/" + entry.name, {
          headers,
          signal: AbortSignal.timeout(20000),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const meta = await res.json();
        const next = {
          stars: meta.stargazers_count ?? entry.stars,
          lang: meta.language ?? entry.lang,
          desc: String(meta.description ?? entry.desc ?? "").replace(/\s+/g, " ").trim(),
          topics: meta.topics ?? entry.topics ?? [],
        };
        for (const key of Object.keys(next)) {
          if (JSON.stringify(next[key]) !== JSON.stringify(entry[key])) {
            entry[key] = next[key];
            changed++;
            break;
          }
        }
      } catch (error) {
        failed++;
        console.warn("refresh failed for " + entry.owner + "/" + entry.name + ": " + error.message);
      }
    })
  );
  await sleep(250);
}

entries.sort((a, b) => b.stars - a.stars);
fs.writeFileSync(dataPath, JSON.stringify(entries, null, 1) + "\n");
console.log("refreshed " + entries.length + " entries, changed " + changed + ", failed " + failed);
