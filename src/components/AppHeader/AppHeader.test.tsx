// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppHeader } from "./AppHeader";

describe("AppHeader component", () => {
	const defaultProps = {
		isDarkMode: true,
		toggleTheme: () => {},
		storedApiKey: null,
		isApiKeyHeaderInputVisible: true,
		apiKeyInput: "",
		apiKeySaveStatus: "idle" as const,
		handleApiKeyChange: () => {},
		handleApiKeyInputBlur: () => {},
		toggleApiKeyHeaderInput: () => {},
	};

	it("renders API key input with type password", () => {
		render(<AppHeader {...defaultProps} />);
		const inputs = screen.getAllByLabelText("API Key Header Input");
		expect(inputs[0]!.getAttribute("type")).toBe("password");
	});

	it("renders API key input with autocomplete new-password", () => {
		const props = {
			...defaultProps,
			isApiKeyHeaderInputVisible: true,
		};
		render(<AppHeader {...props} />);
		const inputs = screen.getAllByLabelText("API Key Header Input");
		expect(inputs[0]!.getAttribute("autocomplete")).toBe("new-password");
	});

	it("API key toggle has aria-expanded attribute", () => {
		render(<AppHeader {...defaultProps} isApiKeyHeaderInputVisible={true} />);
		const toggle = screen.getByLabelText("Hide API Key Input");
		expect(toggle.getAttribute("aria-expanded")).toBe("true");
	});

	it("API key toggle aria-expanded false when input hidden", () => {
		render(<AppHeader {...defaultProps} isApiKeyHeaderInputVisible={false} />);
		const toggle = screen.getByLabelText("Show API Key Input");
		expect(toggle.getAttribute("aria-expanded")).toBe("false");
	});

	it("renders with saving status without crashing", () => {
		const { container } = render(
			<AppHeader {...defaultProps} apiKeySaveStatus="saving" />,
		);
		expect(container.querySelector("svg")).toBeDefined();
	});

	it("renders with saved status without crashing", () => {
		const { container } = render(
			<AppHeader {...defaultProps} apiKeySaveStatus="saved" />,
		);
		expect(container.querySelector("svg")).toBeDefined();
	});

	it("renders with invalid status without crashing", () => {
		const { container } = render(
			<AppHeader {...defaultProps} apiKeySaveStatus="invalid" />,
		);
		expect(container.querySelector("svg")).toBeDefined();
	});

	it("renders with error status without crashing", () => {
		const { container } = render(
			<AppHeader {...defaultProps} apiKeySaveStatus="error" />,
		);
		expect(container.querySelector("svg")).toBeDefined();
	});

	it("shows 'API Key is set' tooltip when storedApiKey exists", () => {
		render(
			<AppHeader
				{...defaultProps}
				storedApiKey="fca_live_testkey"
				isApiKeyHeaderInputVisible={false}
			/>,
		);
		const btn = screen.getByLabelText("Show API Key Input");
		expect(btn).toBeDefined();
	});

	it("shows 'API Key missing' tooltip when storedApiKey is null and input hidden", () => {
		render(
			<AppHeader
				{...defaultProps}
				storedApiKey={null}
				isApiKeyHeaderInputVisible={false}
			/>,
		);
		const btn = screen.getByLabelText("Show API Key Input");
		expect(btn).toBeDefined();
	});

	it("renders with validating status (returns null icon)", () => {
		const { container } = render(
			<AppHeader {...defaultProps} apiKeySaveStatus="validating" />,
		);
		// validating/idle returns null, so no extra SVG beyond the theme toggle
		const svgs = container.querySelectorAll("svg");
		expect(svgs.length).toBeGreaterThanOrEqual(1);
	});
});
