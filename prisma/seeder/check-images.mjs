import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { IMAGES } = require("./data/images.js");

const dir = path.join(import.meta.dirname, "data");
const urls = new Set();

function collect(val) {
  if (typeof val === "string" && val.startsWith("http")) urls.add(val);
  else if (Array.isArray(val)) val.forEach(collect);
  else if (val && typeof val === "object") Object.values(val).forEach(collect);
}

collect(IMAGES);

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".js") || f === "images.js") continue;
  const text = fs.readFileSync(path.join(dir, f), "utf8");
  const matches = text.match(/https:\/\/images\.unsplash\.com\/[^\s"'`]+/g) || [];
  for (const u of matches) urls.add(u);
}

const bad = [];
const ok = [];

for (const url of urls) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    const ct = res.headers.get("content-type") || "";
    if (res.ok && ct.startsWith("image/")) ok.push(url);
    else bad.push({ url, status: res.status, ct });
  } catch (e) {
    bad.push({ url, error: e.message });
  }
}

console.log(`OK: ${ok.length}, BAD: ${bad.length}`);
for (const b of bad) console.log(JSON.stringify(b));
