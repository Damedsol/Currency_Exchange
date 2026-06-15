// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(() => {
	class ResizeObserverMock {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
	vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});
import { AppMessageBar } from "./AppMessageBar";

describe("AppMessageBar", () => {
	const defaultVisible = {
		appMessage: {
			text: "Test message",
			intent: "info" as const,
			visible: true,
		},
		dismissMessage: vi.fn(),
	};

	const defaultHidden = {
		...defaultVisible,
		appMessage: { ...defaultVisible.appMessage, visible: false },
	};

	it("renders message text when visible", () => {
		render(<AppMessageBar {...defaultVisible} />);
		expect(screen.getByText("Test message")).toBeDefined();
	});

	it("does not render message when hidden", () => {
		render(<AppMessageBar {...defaultHidden} />);
		expect(screen.queryByText("Test message")).toBeNull();
	});

	it("renders dismiss button when visible", () => {
		render(<AppMessageBar {...defaultVisible} />);
		expect(screen.getByLabelText("Dismiss message")).toBeDefined();
	});

	it("shows success intent message", () => {
		render(
			<AppMessageBar
				appMessage={{ text: "Success", intent: "success", visible: true }}
				dismissMessage={vi.fn()}
			/>,
		);
		expect(screen.getByText(/Success/)).toBeDefined();
	});

	it("shows error intent message", () => {
		render(
			<AppMessageBar
				appMessage={{ text: "Error", intent: "error", visible: true }}
				dismissMessage={vi.fn()}
			/>,
		);
		expect(screen.getByText(/Error/)).toBeDefined();
	});

	it("calls dismissMessage on dismiss button click", async () => {
		const dismiss = vi.fn();
		render(
			<AppMessageBar
				appMessage={{ text: "Dismiss me", intent: "info", visible: true }}
				dismissMessage={dismiss}
			/>,
		);
		await userEvent.click(screen.getByLabelText("Dismiss message"));
		expect(dismiss).toHaveBeenCalledOnce();
	});

	it("does not render when intent is warning and hidden", () => {
		render(
			<AppMessageBar
				appMessage={{ text: "Warning", intent: "warning", visible: false }}
				dismissMessage={vi.fn()}
			/>,
		);
		expect(screen.queryByText(/Warning/)).toBeNull();
	});
});
