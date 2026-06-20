// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";
import { ThemeProvider } from "./hooks/useTheme";

describe("App", () => {
	const renderApp = () =>
		render(
			<ThemeProvider>
				<App />
			</ThemeProvider>,
		);

	it("renders without crashing", () => {
		const { container } = renderApp();
		expect(container).toBeDefined();
	});

	it("renders Currency Converter Controls heading", () => {
		const { container } = renderApp();
		expect(container.textContent).toContain("Currency Converter Controls");
	});

	it("shows Suspense fallback for lazy HistoryPanel", () => {
		const { container } = renderApp();
		expect(container.textContent).toContain("Loading history");
	});

	it("has AppHeader with themed content", () => {
		const { container } = renderApp();
		expect(container.textContent).toContain("Active");
	});
});
