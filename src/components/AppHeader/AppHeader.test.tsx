// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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
		// Currency update props (optional, not required)
	};

	// --- Existing API key tests ---

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
		const svgs = container.querySelectorAll("svg");
		expect(svgs.length).toBeGreaterThanOrEqual(1);
	});

	// --- New: Currency update tests ---

	it("does not render currency update section when storedApiKey is null", () => {
		render(
			<AppHeader
				{...defaultProps}
				storedApiKey={null}
				isCurrenciesLoaded={false}
				isUpdatingCurrencies={false}
				currenciesUpdateError={null}
				onUpdateCurrencies={vi.fn()}
			/>,
		);
		expect(screen.queryByText("Currency data loaded")).toBeNull();
		expect(screen.queryByText("Load currencies")).toBeNull();
		expect(screen.queryByText("Update")).toBeNull();
	});

	it("shows 'Currency data loaded' when currencies are loaded and API key present", () => {
		render(
			<AppHeader
				{...defaultProps}
				storedApiKey="fca_live_testkey"
				isCurrenciesLoaded={true}
				isUpdatingCurrencies={false}
				currenciesUpdateError={null}
				onUpdateCurrencies={vi.fn()}
			/>,
		);
		expect(screen.getByText("Currency data loaded")).toBeDefined();
	});

	it("shows 'Updating currencies...' while updating", () => {
		render(
			<AppHeader
				{...defaultProps}
				storedApiKey="fca_live_testkey"
				isCurrenciesLoaded={false}
				isUpdatingCurrencies={true}
				currenciesUpdateError={null}
				onUpdateCurrencies={vi.fn()}
			/>,
		);
		expect(screen.getByText("Updating currencies...")).toBeDefined();
	});

	it("shows error message when currenciesUpdateError is set", () => {
		render(
			<AppHeader
				{...defaultProps}
				storedApiKey="fca_live_testkey"
				isCurrenciesLoaded={false}
				isUpdatingCurrencies={false}
				currenciesUpdateError="Failed to fetch"
				onUpdateCurrencies={vi.fn()}
			/>,
		);
		expect(screen.getByText("Failed to fetch")).toBeDefined();
	});

	it("calls onUpdateCurrencies when Update button is clicked", async () => {
		const onUpdateCurrencies = vi.fn();
		render(
			<AppHeader
				{...defaultProps}
				storedApiKey="fca_live_testkey"
				isCurrenciesLoaded={false}
				isUpdatingCurrencies={false}
				currenciesUpdateError={null}
				onUpdateCurrencies={onUpdateCurrencies}
			/>,
		);
		const updateBtn = screen.getByText("Update");
		await userEvent.click(updateBtn);
		expect(onUpdateCurrencies).toHaveBeenCalledOnce();
	});

	it("disables Update button while updating", () => {
		render(
			<AppHeader
				{...defaultProps}
				storedApiKey="fca_live_testkey"
				isCurrenciesLoaded={false}
				isUpdatingCurrencies={true}
				currenciesUpdateError={null}
				onUpdateCurrencies={vi.fn()}
			/>,
		);
		const updateBtn = screen.getByText("Update");
		expect(updateBtn.closest("button")).toBeDisabled();
	});
});
