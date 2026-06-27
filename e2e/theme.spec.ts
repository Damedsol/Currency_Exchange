import { expect, test } from "@playwright/test";

test.describe("Theme switching", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("renders theme toggle with current mode label", async ({ page }) => {
		await expect(
			page.getByText(/Light Mode Active|Dark Mode Active/),
		).toBeVisible();
	});

	test("theme toggle switch is interactive", async ({ page }) => {
		const switchEl = page.getByRole("switch");
		await expect(switchEl).toBeVisible();
	});

	test("switch has role and aria-checked attributes", async ({ page }) => {
		const switchEl = page.getByRole("switch");
		await expect(switchEl).toHaveAttribute("role", "switch");
	});

	test("page loads with correct document title", async ({ page }) => {
		await expect(page).toHaveTitle("Currency Exchange");
	});

	test("clicking the switch toggles the label text", async ({ page }) => {
		const initialLabel = await page
			.getByText(/Light Mode Active|Dark Mode Active/)
			.textContent();
		const wasDark = initialLabel === "Dark Mode Active";

		await page.getByRole("switch").click();

		if (wasDark) {
			await expect(page.getByText("Light Mode Active")).toBeVisible();
		} else {
			await expect(page.getByText("Dark Mode Active")).toBeVisible();
		}
	});

	test("clicking the switch toggles the data-theme attribute on html", async ({
		page,
	}) => {
		const initialTheme = await page.evaluate(() =>
			document.documentElement.getAttribute("data-theme"),
		);
		expect(["dark", "light"]).toContain(initialTheme);

		await page.getByRole("switch").click();
		await page.waitForTimeout(100);

		const toggledTheme = await page.evaluate(() =>
			document.documentElement.getAttribute("data-theme"),
		);
		expect(toggledTheme).not.toBe(initialTheme);
	});

	test("theme toggle renders a theme icon (sun or moon SVG)", async ({
		page,
	}) => {
		// The ThemeSwitcher contains an icon SVG + a Switch + a label.
		// Get the SVG path data for the theme icon (first icon before the label).
		const hasThemeSvg = await page.evaluate(() => {
			// Find the label text containing the mode
			const labels = document.querySelectorAll("label");
			for (const label of Array.from(labels)) {
				if (
					label.textContent?.includes("Mode Active") &&
					label.previousElementSibling
				) {
					const svg =
						label.previousElementSibling.querySelector("svg.fui-Icon");
					return svg !== null;
				}
			}
			return false;
		});
		expect(hasThemeSvg).toBe(true);
	});

	test("clicking the switch toggles the theme icon between sun and moon", async ({
		page,
	}) => {
		// Helper: get the SVG path `d` attribute of the theme icon
		const getThemeIconPath = async () => {
			return page.evaluate(() => {
				const labels = document.querySelectorAll("label");
				for (const label of Array.from(labels)) {
					if (label.textContent?.includes("Mode Active")) {
						const iconSpan = label.previousElementSibling;
						if (iconSpan) {
							const path = iconSpan.querySelector("svg.fui-Icon path");
							return path?.getAttribute("d") ?? null;
						}
					}
				}
				return null;
			});
		};

		const pathBefore = await getThemeIconPath();
		expect(pathBefore).not.toBeNull();

		// Toggle theme
		await page.getByRole("switch").click();
		await page.waitForTimeout(200);

		const pathAfter = await getThemeIconPath();
		expect(pathAfter).not.toBeNull();

		// Sun and Moon have different SVG path data
		expect(pathAfter).not.toBe(pathBefore);
	});
});
