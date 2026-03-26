import { chromium, Browser, Page } from 'playwright';

export interface PageSnapshot {
  url: string;
  title: string;
  content: string;
  screenshotPath?: string;
}

export class BrowserService {
  private browser: Browser | null = null;

  async init() {
    this.browser = await chromium.launch({ headless: true });
  }

  async getSnapshot(url: string, screenshotDir?: string): Promise<PageSnapshot> {
    if (!this.browser) await this.init();
    
    const page = await this.browser!.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      
      const title = await page.title();
      const content = await page.textContent('body') || '';
      
      let screenshotPath;
      if (screenshotDir) {
        screenshotPath = `${screenshotDir}/screenshot_${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath });
      }

      return {
        url,
        title,
        content: content.trim().substring(0, 5000), // Limitando contexto
        screenshotPath
      };
    } finally {
      await page.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
