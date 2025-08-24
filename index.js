import { chromium } from "patchright";
import fs from "fs";

const browser = await chromium.launchPersistentContext("data", {
  channel: "chrome",
  headless: false,
  viewport: null,
});

const data = {
  image: {
    name: "imageggggg1.png",
    mimeType: "image/png",
    buffer: fs.readFileSync("./imageggggg1.png"),
  },
  characterIds: ["26446418"], // Character IDs
};

const page = await browser.newPage();
await page.goto("https://toyhou.se/~images/upload");

// Set Image
await page.setInputFiles('form input[name="image"]', data.image);

// Set Characters
await page.evaluate((data) => {
  const form = document.querySelector("form");
  if (form) {
    data.characterIds.forEach((id) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "character_ids[]";
      input.value = id;
      form.appendChild(input);
    });
  }
}, data);

await page.click('form input[type="submit"]');
await page.waitForURL(/https:\/\/toyhou\.se\/~images\/\d+/);

console.log("Upload complete.");
await page.close();

// const content = await page.evaluate(() => document.body.innerText); // Grab visible content
// console.log("Scraped content:", content);

// await browser.close();
process.stdin.resume();
