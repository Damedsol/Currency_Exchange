import { expect, test } from "@playwright/test";

test.describe("Smoke tests", () => {
	test("page loads with correct title", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveTitle("Currency Exchange");
	});

	test("renders main heading and theme switcher", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("text=Currency Exchange")).toBeVisible();
		await expect(page.locator("text=Active")).toBeVisible();
	});

	test("conversion history shows empty state on first load", async ({ page }) => {
		await page.goto("/");
		await expect(
			page.locator("text=No conversion history yet."),
		).toBeVisible();
	});
});
