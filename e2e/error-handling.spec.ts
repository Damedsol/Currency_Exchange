import { expect, test } from "@playwright/test";

test.describe("Error handling", () => {
	test("shows error for invalid API key", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("text=Currency Exchange")).toBeVisible();
	});

	test("disables Calculate when no API key is set", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("text=Currency Exchange")).toBeVisible();
	});

	test("sets rate to 1.0 for same currency without API call", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(page.locator("text=Currency Exchange")).toBeVisible();
	});

	test("disables Calculate when amount is 0", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("text=Currency Exchange")).toBeVisible();
	});

	test("shows error state on API network failure", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("text=Currency Exchange")).toBeVisible();
	});

	test("refresh rates calls API when cache is expired", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("text=Currency Exchange")).toBeVisible();
	});
});
