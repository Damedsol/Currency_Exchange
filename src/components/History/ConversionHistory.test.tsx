// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ConversionHistoryEntry } from "../../types";
import { ConversionHistory } from "./ConversionHistory";

const mockEntry: ConversionHistoryEntry = {
	amount: 100,
	fromCurrency: "USD",
	toCurrency: "EUR",
	result: 92.5,
	rate: 0.925,
	timestamp: Date.now(),
};

describe("ConversionHistory", () => {
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

	it("renders history entries in table rows", () => {
		render(<ConversionHistory history={[mockEntry]} onRepeat={() => {}} />);
		const rows = screen.getAllByRole("row");
		expect(rows.length).toBeGreaterThan(1);
	});

	it("has repeat button for each entry", () => {
		render(<ConversionHistory history={[mockEntry]} onRepeat={() => {}} />);
		const repeatBtn = screen.getByRole("button", { name: /repeat/i });
		expect(repeatBtn).toBeDefined();
	});

	it("renders multiple columns with data", () => {
		render(<ConversionHistory history={[mockEntry]} onRepeat={() => {}} />);
		expect(screen.getAllByText("USD").length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByText("EUR").length).toBeGreaterThanOrEqual(1);
	});

	it("renders table with aria-label on region", () => {
		render(<ConversionHistory history={[mockEntry]} onRepeat={() => {}} />);
		const region = screen.getByRole("region");
		expect(region.getAttribute("aria-label")).toBeTruthy();
	});

	it('shows "Invalid date" for null timestamp', () => {
		const entry = { ...mockEntry, timestamp: null as unknown as number };
		render(<ConversionHistory history={[entry]} onRepeat={() => {}} />);
		const invalidDates = screen.getAllByText("Invalid date");
		expect(invalidDates.length).toBeGreaterThan(0);
	});

	it("clicking repeat button calls onRepeat with entry", async () => {
		const userEvent = (await import("@testing-library/user-event")).default;
		const onRepeat = vi.fn();
		render(<ConversionHistory history={[mockEntry]} onRepeat={onRepeat} />);
		await userEvent.click(screen.getByRole("button", { name: /repeat/i }));
		expect(onRepeat).toHaveBeenCalledWith(mockEntry);
	});

	it("renders history with empty entries gracefully", () => {
		render(<ConversionHistory history={[]} onRepeat={() => {}} />);
		expect(screen.getByRole("table")).toBeDefined();
	});
});
