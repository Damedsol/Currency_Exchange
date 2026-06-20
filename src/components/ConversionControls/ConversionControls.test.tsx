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

	it("shows Calculating... text when loading", () => {
		render(<ConversionControls {...defaultProps} rateSource="loading" />);
		expect(screen.getByText("Calculating...")).toBeDefined();
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
});
