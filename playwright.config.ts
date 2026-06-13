import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: true,
	retries: 1,
	workers: 1,
	reporter: "html",
	use: {
		baseURL: "http://localhost:4173",
		trace: "on-first-retry",
	},
	webServer: {
		command: "pnpm run preview",
		port: 4173,
		reuseExistingServer: true,
	},
});
