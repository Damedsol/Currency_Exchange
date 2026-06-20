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

	it("sets status to invalid when format is wrong after debounce", async () => {
		mockFetchService.mockReturnValue(null);
		const { result } = renderHook(() => useApiKey());
		act(() => {
			result.current.handleApiKeyChange({
				target: { value: "invalid-key-format" },
			} as React.ChangeEvent<HTMLInputElement>);
		});
		expect(result.current.apiKeySaveStatus).toBe("validating");
		await waitFor(
			() => {
				expect(result.current.apiKeySaveStatus).toBe("invalid");
			},
			{ timeout: 2000 },
		);
		expect(result.current.isApiKeyValid).toBe(false);
	});

	it("saves valid key after debounce and clears rates cache", async () => {
		mockFetchService.mockReturnValue(null);
		mockStoreService.mockResolvedValue(undefined);
		const validKey = "fca_live_abcdefghijklmnopqrstuvwxyz12";
		const { result } = renderHook(() => useApiKey());
		act(() => {
			result.current.handleApiKeyChange({
				target: { value: validKey },
			} as React.ChangeEvent<HTMLInputElement>);
		});
		await waitFor(
			() => {
				expect(mockStoreService).toHaveBeenCalledWith(validKey);
			},
			{ timeout: 2000 },
		);
		expect(mockClearRatesCache).toHaveBeenCalled();
		expect(result.current.apiKeySaveStatus).toBe("saved");
		expect(result.current.storedApiKey).toBe(validKey);
	});

	it("sets status to error when localStorage store fails", async () => {
		mockFetchService.mockReturnValue(null);
		mockStoreService.mockRejectedValue(new Error("Storage full"));
		const validKey = "fca_live_abcdefghijklmnopqrstuvwxyz12";
		const { result } = renderHook(() => useApiKey());
		act(() => {
			result.current.handleApiKeyChange({
				target: { value: validKey },
			} as React.ChangeEvent<HTMLInputElement>);
		});
		await waitFor(
			() => {
				expect(result.current.apiKeySaveStatus).toBe("error");
			},
			{ timeout: 2000 },
		);
		expect(result.current.storedApiKey).toBeNull();
	});

	it("trims whitespace from key before validation", async () => {
		mockFetchService.mockReturnValue(null);
		mockStoreService.mockResolvedValue(undefined);
		const validKey = "fca_live_abcdefghijklmnopqrstuvwxyz12";
		const { result } = renderHook(() => useApiKey());
		act(() => {
			result.current.handleApiKeyChange({
				target: { value: `  ${validKey}  ` },
			} as React.ChangeEvent<HTMLInputElement>);
		});
		await waitFor(
			() => {
				expect(mockStoreService).toHaveBeenCalledWith(validKey);
			},
			{ timeout: 2000 },
		);
	});

	it("cleans up timeouts on unmount", () => {
		mockFetchService.mockReturnValue(null);
		const { unmount } = renderHook(() => useApiKey());
		expect(() => unmount()).not.toThrow();
	});

	it("does not load invalid stored key on init", () => {
		mockFetchService.mockReturnValue("invalid_format_key");
		const { result } = renderHook(() => useApiKey());
		expect(result.current.storedApiKey).toBeNull();
		expect(result.current.apiKeyInput).toBe("");
	});

	it("clears API key correctly", () => {
		mockFetchService.mockReturnValue(null);
		const { result } = renderHook(() => useApiKey());
		act(() => {
			result.current.clearApiKey();
		});
		expect(result.current.apiKeyInput).toBe("");
		expect(result.current.storedApiKey).toBeNull();
		expect(result.current.apiKeySaveStatus).toBe("idle");
		expect(result.current.isApiKeyValid).toBe(true);
	});
});
