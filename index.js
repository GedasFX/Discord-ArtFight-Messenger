import express from "express";
import multer from "multer";
import { chromium } from "patchright";

const uploadUrl = 'https://toyhou.se/~images/upload';

const browser = await chromium.launchPersistentContext("data", {
  channel: "chrome",
  headless: false,
  viewport: null,
});

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(express.json());

app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const characterIds = req.body.character_ids ? (Array.isArray(req.body.character_ids) ? req.body.character_ids : [req.body.character_ids]) : [];

  const page = await browser.newPage();
  await page.goto(uploadUrl);

  if (page.url() !== uploadUrl) {
    await page.close();
    return res.status(403).json({ error: "Not logged in" });
  }

  // Set Image
  await page.setInputFiles('input[name="image"]', {
    name: req.file.originalname,
    mimeType: req.file.mimetype,
    buffer: req.file.buffer,
  });

  // Set Characters
  await page.evaluate((ids) => {
    const form = document.querySelector("form");
    if (form) {
      ids.forEach((id) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "character_ids[]";
        input.value = id;
        form.appendChild(input);
      });
    }
  }, characterIds);

  // Submit form and handle new page
  await page.click('form input[type="submit"]');
  await page.waitForURL(/https:\/\/toyhou\.se\/~images\/\d+/);

  await page.close();

  res.json({ status: "Upload complete" });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});

process.on("SIGTERM", async () => {
  await browser.close();
  server.close();

  process.exit();
});

process.on("SIGINT", async () => {
  await browser.close();
  server.close();

  process.exit();
});