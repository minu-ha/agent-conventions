// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
	// [!code error]
	expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
	use: { viewport: { width: 1280, height: 720 }, timezoneId: "Asia/Seoul" },
});
