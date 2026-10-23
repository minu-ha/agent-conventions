// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
	projects: [
		{ name: "e2e", testMatch: "**/*.e2e.spec.ts", use: { baseURL: "http://localhost:5175" } },
		{
			name: "integration",
			testMatch: "**/*.integration.spec.ts",
			// [!code ++]
			use: { baseURL: "http://localhost:5175/test/_gallery/index.html", serviceWorkers: "block" },
		},
	],
	webServer: {
		// 프로젝트에서 앱과 gallery를 같은 테스트 빌드로 만드는 명령
		command: "npm run preview:test",
		url: "http://localhost:5175/test/_gallery/index.html",
	},
});
