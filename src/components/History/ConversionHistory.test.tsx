// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ConversionHistoryEntry } from "../../services/LocalStorage";
import { ConversionHistory } from "./ConversionHistory";

const mockEntry: ConversionHistoryEntry = {
	amount: 100,
	fromCurrency: "USD",
	toCurrency: "EUR",
	result: 92.5,
	rate: 0.925,
	timestamp: Date.now(),
};

describe("ConversionHistory accessibility", () => {
	it('has role="region" on the table wrapper', () => {
		render(<ConversionHistory history={[mockEntry]} onRepeat={() => {}} />);
		const region = screen.getByRole("region");
		expect(region).toBeDefined();
	});

	it("has scope attribute on header cells", () => {
		render(<ConversionHistory history={[mockEntry]} onRepeat={() => {}} />);
		const headers = screen.getAllByRole("columnheader");
		for (const header of headers) {
			expect(header.getAttribute("scope")).toBe("col");
		}
	});
});
