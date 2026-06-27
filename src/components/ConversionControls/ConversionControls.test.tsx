// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConversionControls } from "./ConversionControls";

describe("ConversionControls", () => {
	const defaultProps = {
		fromCurrency: "EUR",
		toCurrency: "USD",
		amount: 1000,
		rate: 1.2,
		rateSource: "idle" as const,
		storedApiKey: "test-key",
		isApiKeyValid: true,
		apiKeyInput: "",
		conversionHistory: [],
		currencies: undefined,
		handleFromCurrency: () => {},
		handleToCurrency: () => {},
		swapCurrencies: () => {},
		handleAmountChange: () => {},
		handleClearCacheAndFetch: () => {},
		fetchRate: () => Promise.resolve(),
		clearConversionHistory: () => {},
		clearApiAndCache: () => {},
	};

	it("renders Calculate button", () => {
		render(<ConversionControls {...defaultProps} />);
		expect(screen.getByText("Calculate")).toBeDefined();
	});

	it("renders CurrencyRow component", () => {
		render(<ConversionControls {...defaultProps} />);
		expect(screen.getByLabelText("Swap currencies")).toBeDefined();
	});

	it("renders amount input", () => {
		render(<ConversionControls {...defaultProps} />);
		expect(screen.getByRole("spinbutton")).toBeDefined();
	});

	it("renders ResultSection with rate info", () => {
		render(<ConversionControls {...defaultProps} />);
		expect(screen.getByText(/Result/)).toBeDefined();
	});

	it("renders ActionButtons (Clear all data)", () => {
		render(<ConversionControls {...defaultProps} />);
		expect(screen.getByText("Clear all data")).toBeDefined();
	});

	it("Calculate button disabled when no API key", () => {
		render(<ConversionControls {...defaultProps} storedApiKey={null} />);
		expect(screen.getByText("Calculate")).toBeDefined();
	});

	it("shows Spinner when loading", () => {
		const { container } = render(
			<ConversionControls {...defaultProps} rateSource="loading" />,
		);
		// Spinner renders with role="progressbar" or data-spinner attribute
		const spinner = container.querySelector('[role="progressbar"]');
		expect(spinner).not.toBeNull();
	});

	it("renders ResultSection with zero rate when rate is not a number", () => {
		render(
			<ConversionControls
				{...defaultProps}
				rate={undefined as unknown as number}
			/>,
		);
		const fieldText = screen.getByText(/Result/).textContent;
		expect(fieldText).toBeDefined();
	});

	it("does not show currency update section when API key present", () => {
		render(<ConversionControls {...defaultProps} />);
		// Currency update was moved to AppHeader — assert it's NOT here
		expect(screen.queryByRole("button", { name: /Update/ })).toBeNull();
		expect(screen.queryByText("Load currencies to select them")).toBeNull();
		expect(screen.queryByText("Currency data loaded")).toBeNull();
		expect(screen.queryByText("Updating currencies...")).toBeNull();
	});
});
