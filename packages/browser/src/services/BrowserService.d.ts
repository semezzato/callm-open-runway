export interface PageSnapshot {
    url: string;
    title: string;
    content: string;
    screenshotPath?: string;
}
export declare class BrowserService {
    private browser;
    init(): Promise<void>;
    getSnapshot(url: string, screenshotDir?: string): Promise<PageSnapshot>;
    close(): Promise<void>;
}
//# sourceMappingURL=BrowserService.d.ts.map