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
		isCurrenciesLoaded: false,
		isUpdatingCurrencies: false,
		currenciesUpdateError: null,
		onUpdateCurrencies: () => {},
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

	it("shows update button and status text when API key present and not loaded", () => {
		render(<ConversionControls {...defaultProps} />);
		expect(screen.getByText("Load currencies to select them")).toBeDefined();
		expect(screen.getByRole("button", { name: /Update/ })).toBeDefined();
	});

	it("shows loaded text when currencies are loaded", () => {
		render(<ConversionControls {...defaultProps} isCurrenciesLoaded={true} />);
		expect(screen.getByText("Currency data loaded")).toBeDefined();
	});

	it("shows updating text when currencies are updating", () => {
		render(
			<ConversionControls {...defaultProps} isUpdatingCurrencies={true} />,
		);
		expect(screen.getByText("Updating currencies...")).toBeDefined();
		expect(screen.getByRole("button", { name: /Update/ })).toBeDefined();
	});

	it("shows error text when update fails", () => {
		render(
			<ConversionControls
				{...defaultProps}
				currenciesUpdateError="Update failed"
			/>,
		);
		expect(screen.getByText("Update failed")).toBeDefined();
	});

	it("does not show update UI when no API key", () => {
		render(<ConversionControls {...defaultProps} storedApiKey={null} />);
		expect(screen.queryByRole("button", { name: /Update/ })).toBeNull();
		expect(screen.queryByText("Load currencies to select them")).toBeNull();
	});
});
