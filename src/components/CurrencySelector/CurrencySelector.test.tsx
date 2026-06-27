// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CurrencyMetadata } from "../../types";
import { CurrencySelector } from "./CurrencySelector";

describe("CurrencySelector", () => {
	const defaultProps = {
		value: "USD",
		onChange: () => {},
		where: "from" as const,
		currencies: undefined as Record<string, CurrencyMetadata> | undefined,
	};

	const mockCurrencies = {
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
	};

	it("renders with a label associated via htmlFor", () => {
		render(<CurrencySelector {...defaultProps} />);
		const label = screen.getByText("Convert From");
		expect(label).toBeDefined();
		expect(label.getAttribute("for")).toBeTruthy();
	});

	it("renders 'Convert To' label when where='to'", () => {
		render(<CurrencySelector {...defaultProps} where="to" />);
		expect(screen.getByText("Convert To")).toBeDefined();
	});

	it("renders disabled select with placeholder option when no currencies provided", () => {
		render(<CurrencySelector {...defaultProps} />);
		const select = screen.getByRole("combobox") as HTMLSelectElement;
		expect(select.disabled).toBe(true);
		expect(select.options.length).toBe(1);
		expect(select.options[0]?.text).toBe("---");
	});

	it("has selected value matching the value prop with currencies", () => {
		render(
			<CurrencySelector
				{...defaultProps}
				currencies={mockCurrencies}
				value="USD"
			/>,
		);
		const select = screen.getByRole("combobox") as HTMLSelectElement;
		expect(select.value).toBe("USD");
	});

	it("onChange fires when selection changes", async () => {
		const userEvent = (await import("@testing-library/user-event")).default;
		const onChange = vi.fn();
		render(
			<CurrencySelector
				{...defaultProps}
				currencies={mockCurrencies}
				onChange={onChange}
			/>,
		);
		const select = screen.getByRole("combobox");
		await userEvent.selectOptions(select, "JPY");
		expect(onChange).toHaveBeenCalledWith("JPY");
	});

	it("uses provided currencies prop and renders native symbols", () => {
		render(
			<CurrencySelector
				{...defaultProps}
				currencies={mockCurrencies}
				value="JPY"
			/>,
		);
		const options = screen.getAllByRole("option");
		expect(options).toHaveLength(2);
		expect(screen.getByText("￥ - Japanese Yen")).toBeDefined();
		expect(screen.getByText("$ - US Dollar")).toBeDefined();
	});
});
