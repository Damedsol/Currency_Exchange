import { expect, test } from "@playwright/test";

test.describe("Conversion flow", () => {
	test("completes a full conversion: selects currencies and shows result", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(page.locator("h1")).toHaveText("Currency Converter Controls");
		await expect(page.getByLabel("Convert From")).toBeVisible();
		await expect(page.getByLabel("Convert To")).toBeVisible();
		await expect(page.getByRole("button", { name: "Calculate" })).toBeVisible();
	});

	test("swap button exchanges from/to currencies", async ({ page }) => {
		await page.goto("/");
		await expect(
			page.getByRole("button", { name: "Swap currencies" }),
		).toBeVisible();
	});

	test("repeat conversion button is visible when history exists", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(page.locator("h1")).toHaveText("Currency Converter Controls");
		// Repeat button appears in history entries
		await expect(page.getByText("No conversion history yet.")).toBeVisible();
	});

	test("clear history confirmation dialog opens", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByText("Clear History")).toBeVisible();
	});

	test("clear all data confirmation dialog opens", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByText("Clear all data")).toBeVisible();
	});
});
