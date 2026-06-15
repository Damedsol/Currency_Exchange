// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResultSection } from "./ResultSection";

describe("ResultSection", () => {
	const defaultProps = {
		rate: 1.2,
		rateSource: "api" as const,
		amount: 100,
		fromCurrency: "EUR",
		toCurrency: "USD",
		onRefreshRates: () => {},
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
});
