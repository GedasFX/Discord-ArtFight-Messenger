import { chromium } from "patchright";

const browser = await chromium.launchPersistentContext("data/local", {
  channel: "chrome",
  headless: false,
  viewport: null,
});

console.log("Browser started.");
const page = await browser.newPage();

await page.goto("https://toyhou.se");

let saveOk = false;
browser.on("close", async () => {
  if (!saveOk) {
    console.error("State was not saved. Close the browser using Enter in the terminal.");
    process.exit(1);
  }
});

console.log("Press Enter to save state...");
process.stdin.resume();
process.stdin.on("data", async () => {
  await page.context().storageState({ path: "data/state.json" });
  saveOk = true;

  await browser.close();
  process.exit(0);
});
