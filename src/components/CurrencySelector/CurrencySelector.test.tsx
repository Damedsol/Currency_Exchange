// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CurrencySelector } from "./CurrencySelector";

describe("CurrencySelector", () => {
	const defaultProps = {
		value: "USD",
		onChange: () => {},
		where: "from" as const,
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

	it("renders multiple currency options", () => {
		render(<CurrencySelector {...defaultProps} />);
		const options = screen.getAllByRole("option");
		expect(options.length).toBeGreaterThan(30);
	});

	it("has selected value matching the value prop", () => {
		render(<CurrencySelector {...defaultProps} value="EUR" />);
		const select = screen.getByRole("combobox") as HTMLSelectElement;
		expect(select.value).toBe("EUR");
	});
});
