import { chromium } from 'playwright';

export async function startAutomation() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  return { browser, page };
}
