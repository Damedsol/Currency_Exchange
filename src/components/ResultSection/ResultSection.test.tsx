// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResultSection } from "./ResultSection";
import type { CurrencyMetadata } from "../../types";

const mockCurrencies: Record<string, CurrencyMetadata> = {
	USD: {
		symbol: "$",
		name: "US Dollar",
		code: "USD",
		symbol_native: "$",
		decimal_digits: 2,
		name_plural: "US dollars",
		rounding: 0,
	},
	JPY: {
		symbol: "¥",
		name: "Japanese Yen",
		code: "JPY",
		symbol_native: "￥",
		decimal_digits: 0,
		name_plural: "Japanese yen",
		rounding: 0,
	},
	BHD: {
		symbol: "BD",
		name: "Bahraini Dinar",
		code: "BHD",
		symbol_native: "د.ب",
		decimal_digits: 3,
		name_plural: "Bahraini dinars",
		rounding: 0,
	},
};

describe("ResultSection", () => {
	const defaultProps = {
		rate: 1.2,
		rateSource: "api" as const,
		amount: 100,
		fromCurrency: "EUR",
		toCurrency: "USD",
		onRefreshRates: () => {},
		currencies: undefined as Record<string, CurrencyMetadata> | undefined,
	};

	it("renders Result text", () => {
		render(<ResultSection {...defaultProps} />);
		expect(screen.getByText("Result")).toBeDefined();
	});

	it("calculates and displays converted amount", () => {
		const { container } = render(<ResultSection {...defaultProps} />);
		expect(container.textContent).toContain("120");
	});

	it("displays rate information", () => {
		render(<ResultSection {...defaultProps} />);
		expect(screen.getByText(/1 EUR =/)).toBeDefined();
	});

	it('shows "--" when rate is 0', () => {
		render(<ResultSection {...defaultProps} rate={0} />);
		expect(screen.getByText("--")).toBeDefined();
	});

	it("shows loading indicator for loading state", () => {
		render(<ResultSection {...defaultProps} rateSource="loading" />);
		expect(screen.getByText("Loading...")).toBeDefined();
	});

	it("shows error indicator for error state", () => {
		render(<ResultSection {...defaultProps} rateSource="error" />);
		expect(screen.getByText("Error fetching rate")).toBeDefined();
	});

	it("has aria-live region", () => {
		const { container } = render(<ResultSection {...defaultProps} />);
		const live = container.querySelector("[aria-live]");
		expect(live).not.toBeNull();
	});

	it("formats JPY amount with 0 decimal places using currencies prop", () => {
		const jpyProps = {
			...defaultProps,
			toCurrency: "JPY",
			rate: 129.5,
			amount: 100,
		};
		const { container } = render(
			<ResultSection {...jpyProps} currencies={mockCurrencies} />,
		);
		// 100 * 129.5 = 12950 with 0 decimals -> no decimal separator
		const resultText = container.textContent!;
		const digits = resultText.replace(/\D/g, ""); // strip all non-digits
		expect(digits).toContain("12950");
	});

	it("defaults to 2 decimal places when currencies prop is not provided", () => {
		const { container } = render(
			<ResultSection {...defaultProps} rate={1.5} />,
		);
		expect(container.textContent).toContain("150");
	});
});
