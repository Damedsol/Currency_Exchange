import { expect, test } from "@playwright/test";

test.describe("Smoke tests", () => {
	test("page loads with correct title", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveTitle("Currency Exchange");
	});

	test("renders main heading and theme switcher", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("h1")).toHaveText("Currency Converter Controls");
		await expect(
			page.getByText(/Light Mode Active|Dark Mode Active/),
		).toBeVisible();
	});

	test("conversion history shows empty state on first load", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(page.locator("text=No conversion history yet.")).toBeVisible();
	});
});
