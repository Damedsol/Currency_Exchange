// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
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
		const button = screen.getByRole("button", { name: "Swap currencies" });
		const styles = getComputedStyle(button);
		const width = Number.parseInt(styles.width, 10);
		const height = Number.parseInt(styles.height, 10);
		expect(width).toBeGreaterThanOrEqual(44);
		expect(height).toBeGreaterThanOrEqual(44);
	});
});
