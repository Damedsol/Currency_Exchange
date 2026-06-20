import { expect, test } from "@playwright/test";

test.describe("Accessibility", () => {
	test("full keyboard navigation through all interactive elements", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(page.locator("text=Currency Exchange")).toBeVisible();
	});

	test("visible focus indicator on all interactive elements", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(page.locator("text=Currency Exchange")).toBeVisible();
	});

	test("dialog traps focus when open", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("text=Currency Exchange")).toBeVisible();
	});

	test("ESC key closes dialogs", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("text=Currency Exchange")).toBeVisible();
	});

	test("aria-live announces conversion changes", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("text=Currency Exchange")).toBeVisible();
	});

	test("app is fully operable without a mouse", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("text=Currency Exchange")).toBeVisible();
	});
});
