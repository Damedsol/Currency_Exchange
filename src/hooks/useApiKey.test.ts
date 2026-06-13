// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useApiKey } from "./useApiKey";

const { mockFetchService, mockStoreService, mockClearRatesCache } = vi.hoisted(
	() => ({
		mockFetchService: vi.fn(),
		mockStoreService: vi.fn(),
		mockClearRatesCache: vi.fn(),
	}),
);

vi.mock("../services/LocalStorage", () => ({
	apiKeyRegex: /^fca_live_[a-z0-9]{28}$/,
	localStorageFetchService: () => mockFetchService(),
	localStorageStoreService: (value: string) => mockStoreService(value),
	clearRatesCache: () => mockClearRatesCache(),
}));

describe("useApiKey", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("initializes with empty values when no stored key", () => {
		mockFetchService.mockReturnValue(null);
		const { result } = renderHook(() => useApiKey());
		expect(result.current.storedApiKey).toBeNull();
		expect(result.current.apiKeyInput).toBe("");
		expect(result.current.isApiKeyValid).toBe(true);
		expect(result.current.isApiKeyHeaderInputVisible).toBe(false);
		expect(result.current.apiKeySaveStatus).toBe("idle");
	});

	it("loads stored API key on init if valid format", async () => {
		mockFetchService.mockReturnValue("fca_live_abcdefghijklmnopqrstuvwxyz12");
		const { result } = renderHook(() => useApiKey());
		await waitFor(() => {
			expect(result.current.storedApiKey).toBe(
				"fca_live_abcdefghijklmnopqrstuvwxyz12",
			);
		});
		expect(result.current.apiKeyInput).toBe(
			"fca_live_abcdefghijklmnopqrstuvwxyz12",
		);
	});

	it("toggles header input visibility", () => {
		mockFetchService.mockReturnValue(null);
		const { result } = renderHook(() => useApiKey());
		expect(result.current.isApiKeyHeaderInputVisible).toBe(false);
		act(() => result.current.toggleApiKeyHeaderInput());
		expect(result.current.isApiKeyHeaderInputVisible).toBe(true);
		act(() => result.current.toggleApiKeyHeaderInput());
		expect(result.current.isApiKeyHeaderInputVisible).toBe(false);
	});

	it("updates input on change", () => {
		mockFetchService.mockReturnValue(null);
		const { result } = renderHook(() => useApiKey());
		act(() => {
			result.current.handleApiKeyChange({
				target: { value: "fca_test" },
			} as React.ChangeEvent<HTMLInputElement>);
		});
		expect(result.current.apiKeyInput).toBe("fca_test");
		expect(result.current.apiKeySaveStatus).toBe("validating");
	});

	it("resets status to idle when input is cleared", () => {
		mockFetchService.mockReturnValue(null);
		const { result } = renderHook(() => useApiKey());
		act(() => {
			result.current.handleApiKeyChange({
				target: { value: "fca_test" },
			} as React.ChangeEvent<HTMLInputElement>);
		});
		act(() => {
			result.current.handleApiKeyChange({
				target: { value: "" },
			} as React.ChangeEvent<HTMLInputElement>);
		});
		expect(result.current.apiKeySaveStatus).toBe("idle");
	});
});
