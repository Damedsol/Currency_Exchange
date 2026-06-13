// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CurrencyRow } from "./CurrencyRow";

describe("CurrencyRow accessibility", () => {
	const defaultProps = {
		fromCurrency: "USD",
		toCurrency: "EUR",
		onFromChange: () => {},
		onToChange: () => {},
		onSwap: () => {},
	};

	it('has aria-label="Swap currencies" on swap button', () => {
		render(<CurrencyRow {...defaultProps} />);
		const button = screen.getByLabelText("Swap currencies");
		expect(button).toBeDefined();
	});

	it("swap button has minimum 44px target size", () => {
		render(<CurrencyRow {...defaultProps} />);
		const buttons = screen.getAllByRole("button", { name: "Swap currencies" });
		const button = buttons[0]!;
		const styles = getComputedStyle(button);
		const minWidth = Number.parseInt(styles.minWidth, 10);
		const minHeight = Number.parseInt(styles.minHeight, 10);
		expect(minWidth).toBeGreaterThanOrEqual(44);
		expect(minHeight).toBeGreaterThanOrEqual(44);
	});
});
