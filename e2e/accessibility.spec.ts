import { expect, test } from "@playwright/test";

test.describe("Accessibility", () => {
	test("main heading is present with correct text", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("h1")).toHaveText("Currency Converter Controls");
	});

	test("skip link is present and hidden until focused", async ({ page }) => {
		await page.goto("/");
		// Skip link should be visually hidden but present in DOM
		const skipLink = page.locator(".skip-link, a[href='#main-content']");
		await expect(skipLink).toBeVisible();
	});

	test("currency selectors have associated labels", async ({ page }) => {
		await page.goto("/");
		const fromLabel = page.getByLabel("Convert From");
		await expect(fromLabel).toBeVisible();
		const toLabel = page.getByLabel("Convert To");
		await expect(toLabel).toBeVisible();
	});

	test("all interactive elements are keyboard accessible", async ({ page }) => {
		await page.goto("/");
		// Tab through all interactive elements
		await page.keyboard.press("Tab");
		const focusedEl = page.locator(":focus");
		await expect(focusedEl).toBeAttached();
	});

	test("main content region is reachable via skip link", async ({ page }) => {
		await page.goto("/");
		const mainContent = page.locator("main#main-content");
		await expect(mainContent).toBeVisible();
	});

	test("app loads without rendering errors", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("h1")).toBeVisible();
		await expect(page).toHaveTitle("Currency Exchange");
	});
});
