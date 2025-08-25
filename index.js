import { config } from "dotenv";
import { discord } from "./src/managers/manager-discord.js";
import { getBrowser } from "./src/managers/manager-browser.js";

config(); // Load environment variables from .env file

const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error("Missing environment variable: TOKEN");
  process.exit(1);
}

await discord.login(process.env.TOKEN);
await getBrowser();