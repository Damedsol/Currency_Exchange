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

	it("has aria-live region for swap announcement", () => {
		render(<CurrencyRow {...defaultProps} />);
		const liveRegion = screen.getByRole("status");
		expect(liveRegion).toBeDefined();
	});

	it("swap button calls onSwap and shows message", async () => {
		const userEvent = (await import("@testing-library/user-event")).default;
		const onSwap = vi.fn();
		render(
			<CurrencyRow
				{...defaultProps}
				onSwap={onSwap}
				fromCurrency="USD"
				toCurrency="EUR"
			/>,
		);
		await userEvent.click(screen.getByLabelText("Swap currencies"));
		expect(onSwap).toHaveBeenCalledTimes(1);
		expect(screen.getByText(/Swapped currencies/)).toBeDefined();
		expect(screen.getByText(/USD.*EUR/)).toBeDefined();
	});
});
