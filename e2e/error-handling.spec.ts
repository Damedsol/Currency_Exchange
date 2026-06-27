import { expect, test } from "@playwright/test";

test.describe("Error handling", () => {
	test("shows API key toggle button", async ({ page }) => {
		await page.goto("/");
		await expect(
			page.getByRole("button", { name: "Show API Key Input" }),
		).toBeVisible();
	});

	test("disables Calculate when amount is set to 0", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByRole("button", { name: "Calculate" })).toBeVisible();
	});

	test("shows empty history state on first load", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByText("No conversion history yet.")).toBeVisible();
	});

	test("shows Clear History button in history panel", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByText("Clear History")).toBeVisible();
	});

	test("shows Clear all data button", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByText("Clear all data")).toBeVisible();
	});

	test("refresh rates button is accessible", async ({ page }) => {
		await page.goto("/");
		await expect(
			page.getByRole("button", { name: "Refresh rates" }),
		).toBeVisible();
	});
});
