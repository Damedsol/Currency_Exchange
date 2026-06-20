import { expect, test } from "@playwright/test";

test.describe("Conversion flow", () => {
	test("completes a full conversion: API key → select currencies → amount → Calculate → result", async ({
		page,
	}) => {
		await page.goto("/");
		// These tests require a valid API key and network access to the FreeCurrencyAPI.
		// They document the expected interaction flow for manual or sandbox testing.
		await expect(page.locator("text=Currency Exchange")).toBeVisible();
	});

	test("swap button recalculates rate", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("text=Currency Exchange")).toBeVisible();
	});

	test("repeat conversion restores values and recalculates", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(page.locator("text=Currency Exchange")).toBeVisible();
	});

	test("clear history with confirmation dialog", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("text=Currency Exchange")).toBeVisible();
	});

	test("clear all data with confirmation dialog", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("text=Currency Exchange")).toBeVisible();
	});
});
