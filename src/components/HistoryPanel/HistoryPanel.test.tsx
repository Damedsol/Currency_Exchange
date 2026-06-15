// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HistoryPanel } from "./HistoryPanel";

describe("HistoryPanel", () => {
	const defaultProps = {
		history: [
			{
				fromCurrency: "EUR",
				toCurrency: "USD",
				amount: 100,
				rate: 1.2,
				result: 120,
				timestamp: 1700000000000,
			},
		],
		onRepeatConversion: vi.fn(),
		clearConversionHistory: vi.fn(),
	};

	it("renders Conversion History heading", () => {
		render(<HistoryPanel {...defaultProps} />);
		expect(screen.getByText(/Conversion History/)).toBeDefined();
	});

	it("renders Clear History button", () => {
		render(<HistoryPanel {...defaultProps} />);
		expect(screen.getByText("Clear History")).toBeDefined();
	});

	it("opens confirm dialog on Clear History click", async () => {
		const userEvent = (await import("@testing-library/user-event")).default;
		render(<HistoryPanel {...defaultProps} />);
		await userEvent.click(screen.getByText("Clear History"));
		expect(
			screen.getByText("Confirmar eliminación del historial"),
		).toBeDefined();
	});

	it("renders no history message when empty", () => {
		render(<HistoryPanel {...defaultProps} history={[]} />);
		expect(screen.getByText("No conversion history yet.")).toBeDefined();
	});

	it("renders conversion entries in the table", () => {
		render(<HistoryPanel {...defaultProps} />);
		expect(screen.getByText("EUR")).toBeDefined();
		expect(screen.getByText("USD")).toBeDefined();
	});
});
