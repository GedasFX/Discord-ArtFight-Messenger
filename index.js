import { chromium } from "patchright";

const browser = await chromium.launchPersistentContext("data/app", {
  channel: "chrome",
  headless: false,
  viewport: null,
});

const page = await browser.newPage();
await page.goto("https://toyhou.se/Snappi/characters/folder:5405072");

const content = await page.evaluate(() => document.body.innerText); // Grab visible content
console.log("Scraped content:", content);

await browser.close();
