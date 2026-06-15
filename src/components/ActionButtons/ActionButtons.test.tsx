// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ActionButtons } from "./ActionButtons";

describe("ActionButtons", () => {
	const defaultProps = {
		storedApiKey: "test-key",
		amount: 1000,
		rateSource: "idle" as const,
		isApiKeyValid: true,
		apiKeyInput: "",
		isHistoryEmpty: true,
		onClearHistory: vi.fn(),
		onClearAll: vi.fn(),
	};

	it('renders "Clear all data" button', () => {
		render(<ActionButtons {...defaultProps} />);
		expect(screen.getByText("Clear all data")).toBeDefined();
	});

	it("opens dialog on clear button click", async () => {
		render(<ActionButtons {...defaultProps} />);
		await userEvent.click(screen.getByText("Clear all data"));
		expect(screen.getByText("Confirmar eliminación")).toBeDefined();
	});

	it("dialog has Cancel button", async () => {
		render(<ActionButtons {...defaultProps} />);
		await userEvent.click(screen.getByText("Clear all data"));
		expect(screen.getByText("Cancelar")).toBeDefined();
	});

	it("dialog has destructive confirm button", async () => {
		render(<ActionButtons {...defaultProps} />);
		await userEvent.click(screen.getByText("Clear all data"));
		const confirmButtons = screen.getAllByText("Eliminar datos");
		expect(confirmButtons.length).toBeGreaterThanOrEqual(1);
	});
});
