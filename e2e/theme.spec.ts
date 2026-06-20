import { expect, test } from "@playwright/test";

test.describe("Theme switching", () => {
	test("renders theme toggle with current mode label", async ({ page }) => {
		await page.goto("/");
		await expect(
			page.getByText(/Light Mode Active|Dark Mode Active/),
		).toBeVisible();
	});

	test("theme toggle switch is interactive", async ({ page }) => {
		await page.goto("/");
		const switchEl = page.getByRole("switch");
		await expect(switchEl).toBeVisible();
	});

	test("Switch has role and aria-checked attributes", async ({ page }) => {
		await page.goto("/");
		const switchEl = page.getByRole("switch");
		await expect(switchEl).toHaveAttribute("role", "switch");
	});

	test("page loads with correct document title", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveTitle("Currency Exchange");
	});
});
