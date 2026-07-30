import { expect, test } from "@playwright/test";

// Valid API key format: fca_live_ + 40 alphanumeric chars
// Use env variable or fall back to a mock key for CI
const VALID_API_KEY = process.env.E2E_API_KEY || "fca_live_" + "a".repeat(40);

test.describe("UI enhancements", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("AppHeader shows currency update section when API key is stored", async ({
		page,
	}) => {
		// Inject a properly formatted API key into localStorage
		await page.evaluate((key) => {
			localStorage.setItem("apiKey", key);
		}, VALID_API_KEY);
		await page.reload();
		await page.waitForLoadState("networkidle");

		// The button's accessible name is the aria-label, not the visible text
		const updateBtn = page
			.locator("header")
			.getByRole("button", { name: "Update currencies from API" });
		await expect(updateBtn).toBeVisible({ timeout: 10000 });

		// Status text should also be present (loaded, loading, or prompt)
		await expect(
			page
				.locator("header")
				.getByText(
					/Load currencies to select them|Updating currencies...|Currency data loaded/,
				),
		).toBeVisible();
	});

	test("header Update button has an SVG icon", async ({ page }) => {
		await page.evaluate((key) => {
			localStorage.setItem("apiKey", key);
		}, VALID_API_KEY);
		await page.reload();
		await page.waitForLoadState("networkidle");

		const updateBtn = page
			.locator("header")
			.getByRole("button", { name: "Update currencies from API" });
		await expect(updateBtn).toBeVisible({ timeout: 10000 });

		// The button should contain an SVG icon (ArrowClockwiseRegular)
		await expect(updateBtn.locator("svg.fui-Icon")).toBeVisible();
	});

	test("Calculate button is present with icon", async ({ page }) => {
		const calcBtn = page.getByRole("button", { name: /^Calculate$/ });
		await expect(calcBtn).toBeVisible();

		// Button should contain an icon SVG (MoneyCalculatorFilled or Spinner)
		const iconSvg = calcBtn.locator("svg.fui-Icon");
		await expect(iconSvg).toBeVisible();
	});

	test("Result section has aria-live region for accessibility", async ({
		page,
	}) => {
		const resultRegion = page.locator("[aria-live]").first();
		await expect(resultRegion).toBeVisible();
	});

	test("custom scrollbar CSS is applied globally", async ({ page }) => {
		const hasScrollbarWidth = await page.evaluate(() => {
			const style = getComputedStyle(document.documentElement);
			return style.getPropertyValue("scrollbar-width") === "thin";
		});
		expect(hasScrollbarWidth).toBe(true);

		const scrollbarColor = await page.evaluate(() => {
			const style = getComputedStyle(document.documentElement);
			return style.getPropertyValue("scrollbar-color");
		});
		expect(scrollbarColor).toBeTruthy();
	});

	test("Rate source indicator renders for different states", async ({
		page,
	}) => {
		// The rate row should be visible
		const rateText = page.getByText(/Rate:/);
		await expect(rateText).toBeVisible();
	});

	test("Conversion history empty state renders correctly", async ({ page }) => {
		await expect(page.getByText("No conversion history yet.")).toBeVisible();
	});

	test("page has custom CSS variables for neon theme", async ({ page }) => {
		const hasCardBorder = await page.evaluate(() => {
			const style = getComputedStyle(document.documentElement);
			return style.getPropertyValue("--card-border").length > 0;
		});
		expect(hasCardBorder).toBe(true);
	});

	test("lazy-loaded HistoryPanel renders heading after Suspense fallback", async ({
		page,
	}) => {
		await expect(
			page.getByRole("heading", { name: /Conversion History/ }),
		).toBeVisible({ timeout: 10000 });
	});
});
