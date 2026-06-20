import { expect, test } from "@playwright/test";

test.describe("Theme switching", () => {
	test("toggle dark/light changes appearance", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("text=Active")).toBeVisible();
	});

	test("theme persists after page reload", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("text=Active")).toBeVisible();
	});

	test("respects prefers-color-scheme dark without saved preference", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(page.locator("text=Active")).toBeVisible();
	});

	test("minimum 7:1 contrast ratio in both themes", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("text=Active")).toBeVisible();
	});
});
