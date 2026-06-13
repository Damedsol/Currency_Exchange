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
});
