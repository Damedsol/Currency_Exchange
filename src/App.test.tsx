// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock hooks with mutable defaults for per-test overrides
const mockApiKey: {
	storedApiKey: string | null;
	isApiKeyValid: boolean;
	apiKeyInput: string;
	isApiKeyHeaderInputVisible: boolean;
	apiKeySaveStatus: string;
	handleApiKeyChange: ReturnType<typeof vi.fn>;
	handleApiKeyInputBlur: ReturnType<typeof vi.fn>;
	toggleApiKeyHeaderInput: ReturnType<typeof vi.fn>;
	clearApiKey: ReturnType<typeof vi.fn>;
} = {
	storedApiKey: "fca_live_test1234567890123456789012345678901",
	isApiKeyValid: true,
	apiKeyInput: "",
	isApiKeyHeaderInputVisible: false,
	apiKeySaveStatus: "idle",
	handleApiKeyChange: vi.fn(),
	handleApiKeyInputBlur: vi.fn(),
	toggleApiKeyHeaderInput: vi.fn(),
	clearApiKey: vi.fn(),
};

const mockAppMessage = {
	appMessage: { text: "", intent: "info" as const },
	showAppMessage: vi.fn(),
	dismissMessage: vi.fn(),
};

const mockConversion = {
	amount: 1000,
	fromCurrency: "EUR",
	toCurrency: "USD",
	rate: 0,
	rateSource: "idle",
	handleFromCurrency: vi.fn(),
	handleToCurrency: vi.fn(),
	handleAmountChange: vi.fn(),
	swapCurrencies: vi.fn(),
	fetchRate: vi.fn(),
	repeatConversion: vi.fn(),
};

const mockHistory = {
	conversionHistory: [] as Array<Record<string, unknown>>,
	addEntry: vi.fn(),
	clearConversionHistory: vi.fn(),
};

vi.mock("./hooks/useApiKey", () => ({
	useApiKey: () => mockApiKey,
}));

vi.mock("./hooks/useAppMessage", () => ({
	useAppMessage: () => mockAppMessage,
}));

vi.mock("./hooks/useConversion", () => ({
	useConversion: () => mockConversion,
}));

vi.mock("./hooks/useConversionHistory", () => ({
	loadInitialHistory: () => [],
	useConversionHistory: () => mockHistory,
}));

vi.mock("./hooks/useTheme", () => ({
	useTheme: () => ({
		isDarkMode: false,
		toggleTheme: vi.fn(),
		theme: {},
	}),
	ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("./styles/globalStyles", () => ({
	useGlobalStyles: vi.fn(),
}));

import App from "./App";

describe("App", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset mutable defaults
		mockApiKey.storedApiKey = "fca_live_test1234567890123456789012345678901";
		mockConversion.amount = 1000;
		mockConversion.fromCurrency = "EUR";
		mockConversion.toCurrency = "USD";
	});

	const renderApp = () => render(<App />);

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

	it("has Clear all data button", () => {
		renderApp();
		expect(screen.getByText("Clear all data")).toBeDefined();
	});

	it("has Calculate button", () => {
		renderApp();
		expect(screen.getByText("Calculate")).toBeDefined();
	});

	it("Clear all data opens confirmation dialog", async () => {
		renderApp();
		await userEvent.click(screen.getByText("Clear all data"));
		expect(screen.getByText("Confirmar eliminación")).toBeDefined();
	});

	it("confirming clear all calls dismissMessage and showAppMessage", async () => {
		renderApp();
		await userEvent.click(screen.getByText("Clear all data"));
		await userEvent.click(screen.getByText("Eliminar datos"));
		expect(mockAppMessage.dismissMessage).toHaveBeenCalled();
		expect(mockAppMessage.showAppMessage).toHaveBeenCalledWith(
			"All data cleared.",
			"warning",
		);
	});

	it("refresh rates button triggers dismissMessage and fetchRate", async () => {
		renderApp();
		await userEvent.click(screen.getByLabelText("Refresh rates"));
		expect(mockAppMessage.dismissMessage).toHaveBeenCalled();
		expect(mockConversion.fetchRate).toHaveBeenCalled();
	});

	it("refresh rates does not fetch when storedApiKey is null", async () => {
		mockApiKey.storedApiKey = null;
		renderApp();
		await userEvent.click(screen.getByLabelText("Refresh rates"));
		expect(mockConversion.fetchRate).not.toHaveBeenCalled();
	});
});
