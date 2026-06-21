// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ConversionHistoryEntry, CurrencyMetadata } from "../../types";
import { ConversionHistory } from "./ConversionHistory";

const mockEntry: ConversionHistoryEntry = {
	amount: 100,
	fromCurrency: "USD",
	toCurrency: "EUR",
	result: 92.5,
	rate: 0.925,
	timestamp: Date.now(),
};

const mockCurrencies: Record<string, CurrencyMetadata> = {
	JPY: {
		symbol: "¥",
		name: "Japanese Yen",
		code: "JPY",
		symbol_native: "¥",
		decimal_digits: 0,
		name_plural: "Japanese yen",
		rounding: 0,
	},
	BHD: {
		symbol: "BD",
		name: "Bahraini Dinar",
		code: "BHD",
		symbol_native: ".د.ب",
		decimal_digits: 3,
		name_plural: "Bahraini dinars",
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
	EUR: {
		symbol: "€",
		name: "Euro",
		code: "EUR",
		symbol_native: "€",
		decimal_digits: 2,
		name_plural: "Euros",
		rounding: 0,
	},
};

/**
 * Helper to compute the expected formatted output for history table cells.
 * The history table uses useGrouping: false.
 */
const fmt = (num: number, digits: number): string =>
	num.toLocaleString(undefined, {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits,
		useGrouping: false,
	});

describe("ConversionHistory", () => {
	it('has role="region" on the table wrapper', () => {
		render(<ConversionHistory history={[mockEntry]} onRepeat={() => {}} />);
		const region = screen.getByRole("region");
		expect(region).toBeDefined();
	});

	it("has scope attribute on header cells", () => {
		render(<ConversionHistory history={[mockEntry]} onRepeat={() => {}} />);
		const headers = screen.getAllByRole("columnheader");
		for (const header of headers) {
			expect(header.getAttribute("scope")).toBe("col");
		}
	});

	it("renders history entries in table rows", () => {
		render(<ConversionHistory history={[mockEntry]} onRepeat={() => {}} />);
		const rows = screen.getAllByRole("row");
		expect(rows.length).toBeGreaterThan(1);
	});

	it("has repeat button for each entry", () => {
		render(<ConversionHistory history={[mockEntry]} onRepeat={() => {}} />);
		const repeatBtn = screen.getByRole("button", { name: /repeat/i });
		expect(repeatBtn).toBeDefined();
	});

	it("renders multiple columns with data", () => {
		render(<ConversionHistory history={[mockEntry]} onRepeat={() => {}} />);
		expect(screen.getAllByText("USD").length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByText("EUR").length).toBeGreaterThanOrEqual(1);
	});

	it("renders table with aria-label on region", () => {
		render(<ConversionHistory history={[mockEntry]} onRepeat={() => {}} />);
		const region = screen.getByRole("region");
		expect(region.getAttribute("aria-label")).toBeTruthy();
	});

	it('shows "Invalid date" for null timestamp', () => {
		const entry = { ...mockEntry, timestamp: null as unknown as number };
		render(<ConversionHistory history={[entry]} onRepeat={() => {}} />);
		const invalidDates = screen.getAllByText("Invalid date");
		expect(invalidDates.length).toBeGreaterThan(0);
	});

	it("clicking repeat button calls onRepeat with entry", async () => {
		const userEvent = (await import("@testing-library/user-event")).default;
		const onRepeat = vi.fn();
		render(<ConversionHistory history={[mockEntry]} onRepeat={onRepeat} />);
		await userEvent.click(screen.getByRole("button", { name: /repeat/i }));
		expect(onRepeat).toHaveBeenCalledWith(mockEntry);
	});

	it("renders history with empty entries gracefully", () => {
		render(<ConversionHistory history={[]} onRepeat={() => {}} />);
		expect(screen.getByRole("table")).toBeDefined();
	});

	describe("decimal digits from currency metadata", () => {
		const jpyEntry: ConversionHistoryEntry = {
			amount: 1000,
			fromCurrency: "JPY",
			toCurrency: "JPY",
			result: 100000,
			rate: 100,
			timestamp: Date.now(),
		};

		const bhdEntry: ConversionHistoryEntry = {
			amount: 1000,
			fromCurrency: "BHD",
			toCurrency: "BHD",
			result: 1000,
			rate: 1,
			timestamp: Date.now(),
		};

		it("formats JPY amount with 0 decimal digits", () => {
			render(
				<ConversionHistory
					history={[jpyEntry]}
					onRepeat={() => {}}
					currencies={mockCurrencies}
				/>,
			);
			// Amount cell is the first cell
			const cells = screen.getAllByRole("cell");
			expect(cells[0]!.textContent).toBe(fmt(1000, 0));
		});

		it("formats JPY result with 0 decimal digits", () => {
			render(
				<ConversionHistory
					history={[jpyEntry]}
					onRepeat={() => {}}
					currencies={mockCurrencies}
				/>,
			);
			const cells = screen.getAllByRole("cell");
			// Result cell is now the 2nd cell (index 1) after Amount
			expect(cells[1]!.textContent).toBe(fmt(100000, 0));
		});

		it("formats JPY rate with 0 decimal digits", () => {
			render(
				<ConversionHistory
					history={[jpyEntry]}
					onRepeat={() => {}}
					currencies={mockCurrencies}
				/>,
			);
			const cells = screen.getAllByRole("cell");
			// Rate cell is the 5th cell (index 4)
			expect(cells[4]!.textContent).toBe(fmt(100, 0));
		});

		it("formats BHD amount with 3 decimal digits", () => {
			render(
				<ConversionHistory
					history={[bhdEntry]}
					onRepeat={() => {}}
					currencies={mockCurrencies}
				/>,
			);
			const cells = screen.getAllByRole("cell");
			expect(cells[0]!.textContent).toBe(fmt(1000, 3));
		});

		it("formats BHD result with 3 decimal digits", () => {
			render(
				<ConversionHistory
					history={[bhdEntry]}
					onRepeat={() => {}}
					currencies={mockCurrencies}
				/>,
			);
			const cells = screen.getAllByRole("cell");
			// Result cell is now the 2nd cell (index 1)
			expect(cells[1]!.textContent).toBe(fmt(1000, 3));
		});

		it("formats BHD rate with 3 decimal digits", () => {
			render(
				<ConversionHistory
					history={[bhdEntry]}
					onRepeat={() => {}}
					currencies={mockCurrencies}
				/>,
			);
			const cells = screen.getAllByRole("cell");
			expect(cells[4]!.textContent).toBe(fmt(1, 3));
		});

		it("defaults to 2 decimal digits when currencies is undefined", () => {
			render(<ConversionHistory history={[jpyEntry]} onRepeat={() => {}} />);
			const cells = screen.getAllByRole("cell");
			expect(cells[0]!.textContent).toBe(fmt(1000, 2));
		});
	});
});
