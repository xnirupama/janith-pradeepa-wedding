import fs from "node:fs/promises";

const read = async file => JSON.parse(await fs.readFile(file, "utf8"));
const report = {
  checkedAt: new Date().toISOString(),
  sourceCommit: "7471b90",
  origin: "https://janith-pradeepa.vercel.app",
  environment: "Isolated Chromium/WebKit; mobile 390x844; policies mocked; physical phones and social webviews untested",
  mediaPolicies: [...await read("artifacts/qa/ambient-chromium/results.json"), ...await read("artifacts/qa/ambient-webkit/results.json")],
  finalScreenshotCases: [...await read("artifacts/qa/ambient-final-chromium/results.json"), ...await read("artifacts/qa/ambient-final-webkit/results.json")],
  opening: await read("artifacts/qa/opening-ambient-regression/results.json"),
  livePages: await read("artifacts/qa/ambient-live/results.json"),
  serving: await read("artifacts/qa/ambient-live-serving.json"),
  performance: await read("artifacts/qa/performance/results.json"),
  mobile: await read("artifacts/qa/mobile/results.json"),
  contrast: await read("media-sources/ambient-contrast-verification.json"),
};
await fs.writeFile("media-sources/ambient-placement-verification.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(Object.fromEntries(Object.entries(report).filter(([, value]) => Array.isArray(value)).map(([name, cases]) => [name, cases.length]))));
