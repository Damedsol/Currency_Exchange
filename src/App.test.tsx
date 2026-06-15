// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { FluentProvider } from "@fluentui/react-components";
import { neonDarkTheme } from "./theme/neonTheme";

describe("App", () => {
	const renderApp = (isDarkMode = true) =>
		render(
			<FluentProvider theme={neonDarkTheme}>
				<App toggleTheme={vi.fn()} isDarkMode={isDarkMode} />
			</FluentProvider>,
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
		const { container } = renderApp(false);
		expect(container.textContent).toContain("Active");
	});
});
