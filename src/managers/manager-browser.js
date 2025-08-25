import { chromium } from "patchright";

let browser;
let inactivityTimer;

function resetInactivityTimer() {
  const duration = Number(process.env.BROWSER_INACTIVITY_TIMEOUT || 2 * 60);

  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(async () => {
    console.log("Closing browser due to inactivity.");
    await browser.close();
    browser = null;
  }, duration * 1000);
}

/**
 * @returns {Promise<import("patchright").BrowserContext>}
 */
export async function getBrowser() {
  if (browser) {
    resetInactivityTimer();
    return browser;
  }

  console.log("Launching browser.");
  browser = await chromium.launchPersistentContext("data", {
    channel: "chrome",
    headless: false,
    viewport: null,
  });

  resetInactivityTimer();
  return browser;
}
