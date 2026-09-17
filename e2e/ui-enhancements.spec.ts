import { expect, type Page, test } from "@playwright/test";

// Valid API key format: fca_live_ + 40 alphanumeric chars
// Use env variable or fall back to a mock key for CI
const VALID_API_KEY = process.env.E2E_API_KEY || "fca_live_" + "a".repeat(40);

const CURRENCIES_FIXTURE = {
	EUR: {
		symbol: "€",
		name: "Euro",
		code: "EUR",
		symbol_native: "€",
		decimal_digits: 2,
		name_plural: "Euros",
		rounding: 0,
	},
	USD: {
		symbol: "$",
		name: "US Dollar",
		code: "USD",
		symbol_native: "$",
		decimal_digits: 2,
		name_plural: "US dollars",
		rounding: 0,
	},
};

const RATES_FIXTURE = { EUR: 0.85, USD: 1 };

/**
 * Mocks the freecurrencyapi endpoints so the automatic currency load (R1) is
 * deterministic and no real API key/quota is used. Must be registered BEFORE
 * navigation: the load starts on mount.
 */
async function mockFreeCurrencyApi(page: Page): Promise<void> {
	await page.route("https://api.freecurrencyapi.com/**", async (route) => {
		const url = route.request().url();
		const data = url.includes("/currencies")
			? CURRENCIES_FIXTURE
			: RATES_FIXTURE;
		await route.fulfill({ json: { data } });
	});
}

test.describe("UI enhancements", () => {
	test.beforeEach(async ({ page }) => {
		await mockFreeCurrencyApi(page);
		await page.goto("/");
	});

	test("AppHeader shows currency update section when API key is stored", async ({
		page,
	}) => {
		// Inject a properly formatted API key into sessionStorage
		await page.evaluate((key) => {
			sessionStorage.setItem("apiKey", key);
		}, VALID_API_KEY);
		await page.reload();
		await page.waitForLoadState("networkidle");

		// The button's accessible name is the aria-label, not the visible text
		const updateBtn = page
			.locator("header")
			.getByRole("button", { name: "Update currencies from API" });
		await expect(updateBtn).toBeVisible({ timeout: 10000 });

		// R1: the status text reaches the loaded state WITHOUT pressing Update
		await expect(
			page.locator("header").getByText("Currency data loaded"),
		).toBeVisible({ timeout: 10000 });

		// R1: both selectors become usable automatically
		await expect(page.getByLabel("Convert From")).toBeEnabled();
		await expect(page.getByLabel("Convert To")).toBeEnabled();
	});

	test("header Update button has an SVG icon", async ({ page }) => {
		await page.evaluate((key) => {
			sessionStorage.setItem("apiKey", key);
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
