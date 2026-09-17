// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrencyMetadata } from "../types";
import { useCurrencies } from "./useCurrencies";

type MockCurrencyRecord = Record<string, CurrencyMetadata>;

const mockCurrencies: MockCurrencyRecord = {
	USD: {
		symbol: "$",
		name: "US Dollar",
		code: "USD",
		symbol_native: "$",
		decimal_digits: 2,
		name_plural: "US dollars",
		rounding: 0,
	},
	JPY: {
		symbol: "¥",
		name: "Japanese Yen",
		code: "JPY",
		symbol_native: "￥",
		decimal_digits: 0,
		name_plural: "Japanese yen",
		rounding: 0,
	},
};

const {
	mockFetchCurrencies,
	mockFetchLatestRates,
	mockLoadCurrenciesFromCache,
	mockSaveCurrenciesToCache,
} = vi.hoisted(() => ({
	mockFetchCurrencies:
		vi.fn<(apiKey: string) => Promise<MockCurrencyRecord | null>>(),
	mockFetchLatestRates:
		vi.fn<(apiKey: string) => Promise<Record<string, number> | null>>(),
	mockLoadCurrenciesFromCache: vi.fn<() => MockCurrencyRecord | null>(),
	mockSaveCurrenciesToCache: vi.fn<(currencies: MockCurrencyRecord) => void>(),
}));

vi.mock("../services/FreeCurrency", () => ({
	fetchCurrencies: mockFetchCurrencies,
	fetchLatestRates: mockFetchLatestRates,
}));

vi.mock("../services/LocalStorage", () => ({
	loadCurrenciesFromCache: mockLoadCurrenciesFromCache,
	saveCurrenciesToCache: mockSaveCurrenciesToCache,
	clearCurrenciesCache: vi.fn(),
}));

const validApiKey = "fca_live_test1234567890123456789012345678901234";
const secondApiKey = "fca_live_second1234567890123456789012345678901";

describe("useCurrencies", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("starts with empty currencies when no cache exists", () => {
		mockLoadCurrenciesFromCache.mockReturnValue(null);
		const { result } = renderHook(() => useCurrencies(null));
		expect(result.current.currencies).toEqual({});
		expect(result.current.isLoaded).toBe(false);
		expect(result.current.isUpdating).toBe(false);
		expect(result.current.lastUpdated).toBeNull();
	});

	it("loads currencies from cache on mount when available", () => {
		mockLoadCurrenciesFromCache.mockReturnValue(mockCurrencies);
		const { result } = renderHook(() => useCurrencies(null));
		expect(result.current.currencies).toEqual(mockCurrencies);
		expect(result.current.isLoaded).toBe(true);
	});

	it("does not fetch when storedApiKey is null", async () => {
		mockLoadCurrenciesFromCache.mockReturnValue(null);
		const { result } = renderHook(() => useCurrencies(null));

		await act(async () => {
			await result.current.updateCurrencies();
		});

		expect(mockFetchCurrencies).not.toHaveBeenCalled();
		expect(mockFetchLatestRates).not.toHaveBeenCalled();
	});

	it("fetches both currencies and rates on updateCurrencies", async () => {
		mockLoadCurrenciesFromCache.mockReturnValue(null);
		mockFetchCurrencies.mockResolvedValue(mockCurrencies);
		mockFetchLatestRates.mockResolvedValue({ EUR: 0.85, JPY: 110, USD: 1.0 });

		const { result } = renderHook(() => useCurrencies(validApiKey));

		await act(async () => {
			await result.current.updateCurrencies();
		});

		expect(mockFetchCurrencies).toHaveBeenCalledWith(validApiKey);
		expect(mockFetchLatestRates).toHaveBeenCalledWith(validApiKey);
		expect(result.current.currencies).toEqual(mockCurrencies);
		expect(result.current.isLoaded).toBe(true);
		expect(result.current.isUpdating).toBe(false);
		expect(result.current.lastUpdated).not.toBeNull();
	});

	it("saves currencies to cache after successful fetch", async () => {
		mockLoadCurrenciesFromCache.mockReturnValue(null);
		mockFetchCurrencies.mockResolvedValue(mockCurrencies);
		mockFetchLatestRates.mockResolvedValue({ EUR: 0.85, USD: 1.0 });

		const { result } = renderHook(() => useCurrencies(validApiKey));

		await act(async () => {
			await result.current.updateCurrencies();
		});

		expect(mockSaveCurrenciesToCache).toHaveBeenCalledWith(mockCurrencies);
	});

	it("sets isUpdating during fetch", async () => {
		mockLoadCurrenciesFromCache.mockReturnValue(null);
		let resolveCurrencies!: (v: typeof mockCurrencies) => void;
		mockFetchCurrencies.mockReturnValue(
			new Promise<typeof mockCurrencies>((resolve) => {
				resolveCurrencies = resolve;
			}),
		);
		mockFetchLatestRates.mockResolvedValue({ EUR: 0.85, USD: 1.0 });

		const { result } = renderHook(() => useCurrencies(validApiKey));

		let updatePromise: Promise<void>;
		act(() => {
			updatePromise = result.current.updateCurrencies();
		});

		await waitFor(() => {
			expect(result.current.isUpdating).toBe(true);
		});

		await act(async () => {
			resolveCurrencies(mockCurrencies);
			await updatePromise!;
		});

		expect(result.current.isUpdating).toBe(false);
	});

	it("sets updateError when fetchCurrencies returns null", async () => {
		mockLoadCurrenciesFromCache.mockReturnValue(null);
		mockFetchCurrencies.mockResolvedValue(null);
		mockFetchLatestRates.mockResolvedValue({ EUR: 0.85, USD: 1.0 });

		const { result } = renderHook(() => useCurrencies(validApiKey));

		await act(async () => {
			await result.current.updateCurrencies();
		});

		expect(result.current.updateError).toBe(
			"Failed to fetch currency data from API.",
		);
		expect(result.current.isLoaded).toBe(false);
	});

	it("sets updateError when fetch throws", async () => {
		mockLoadCurrenciesFromCache.mockReturnValue(null);
		mockFetchCurrencies.mockRejectedValue(new Error("Network error"));
		mockFetchLatestRates.mockResolvedValue({ EUR: 0.85, USD: 1.0 });

		const { result } = renderHook(() => useCurrencies(validApiKey));

		await act(async () => {
			await result.current.updateCurrencies();
		});

		expect(result.current.updateError).toBe("Network error");
	});

	it("preserves existing currencies when update fails", async () => {
		mockLoadCurrenciesFromCache.mockReturnValue(mockCurrencies);
		mockFetchCurrencies.mockResolvedValue(null);
		mockFetchLatestRates.mockResolvedValue({ EUR: 0.85, USD: 1.0 });

		const { result } = renderHook(() => useCurrencies(validApiKey));

		await act(async () => {
			await result.current.updateCurrencies();
		});

		expect(result.current.currencies).toEqual(mockCurrencies);
	});

	it("resets updateError before each update", async () => {
		mockLoadCurrenciesFromCache.mockReturnValue(null);
		mockFetchCurrencies.mockResolvedValueOnce(null);
		mockFetchLatestRates.mockResolvedValueOnce({ EUR: 0.85, USD: 1.0 });

		const { result } = renderHook(() => useCurrencies(validApiKey));

		await act(async () => {
			await result.current.updateCurrencies();
		});

		expect(result.current.updateError).not.toBeNull();

		mockFetchCurrencies.mockResolvedValueOnce(mockCurrencies);
		mockFetchLatestRates.mockResolvedValueOnce({ EUR: 0.85, USD: 1.0 });

		await act(async () => {
			await result.current.updateCurrencies();
		});

		expect(result.current.updateError).toBeNull();
	});

	// --- R1: automatic load as soon as an API key is available ---

	it("R1 auto-fetches currencies and rates when a key is available and no cache exists", async () => {
		mockLoadCurrenciesFromCache.mockReturnValue(null);
		mockFetchCurrencies.mockResolvedValue(mockCurrencies);
		mockFetchLatestRates.mockResolvedValue({ EUR: 0.85, USD: 1.0 });

		const { result } = renderHook(() => useCurrencies(validApiKey));

		await waitFor(() => {
			expect(result.current.isLoaded).toBe(true);
		});

		expect(mockFetchCurrencies).toHaveBeenCalledTimes(1);
		expect(mockFetchLatestRates).toHaveBeenCalledTimes(1);
		expect(mockFetchCurrencies).toHaveBeenCalledWith(validApiKey);
		expect(mockFetchLatestRates).toHaveBeenCalledWith(validApiKey);
		expect(mockSaveCurrenciesToCache).toHaveBeenCalledWith(mockCurrencies);
		expect(result.current.currencies).toEqual(mockCurrencies);
		expect(result.current.isUpdating).toBe(false);
	});

	it("R1 does not auto-fetch when the cached metadata is already loaded", async () => {
		mockLoadCurrenciesFromCache.mockReturnValue(mockCurrencies);

		const { result } = renderHook(() => useCurrencies(validApiKey));

		await act(async () => {
			await Promise.resolve();
		});

		expect(result.current.isLoaded).toBe(true);
		expect(mockFetchCurrencies).not.toHaveBeenCalled();
		expect(mockFetchLatestRates).not.toHaveBeenCalled();
	});

	it("R1 does not auto-fetch when there is no stored API key", async () => {
		mockLoadCurrenciesFromCache.mockReturnValue(null);

		const { result } = renderHook(() => useCurrencies(null));

		await act(async () => {
			await Promise.resolve();
		});

		expect(result.current.isLoaded).toBe(false);
		expect(mockFetchCurrencies).not.toHaveBeenCalled();
		expect(mockFetchLatestRates).not.toHaveBeenCalled();
	});

	it("R1 auto-fetches again when the stored API key changes", async () => {
		mockLoadCurrenciesFromCache.mockReturnValue(null);
		mockFetchCurrencies.mockResolvedValueOnce(null);
		mockFetchLatestRates.mockResolvedValueOnce({ USD: 1.0 });

		const { result, rerender } = renderHook(
			({ apiKey }: { apiKey: string | null }) => useCurrencies(apiKey),
			{ initialProps: { apiKey: validApiKey } },
		);

		await waitFor(() => {
			expect(result.current.updateError).not.toBeNull();
		});
		expect(mockFetchCurrencies).toHaveBeenCalledTimes(1);

		mockFetchCurrencies.mockResolvedValueOnce(mockCurrencies);
		mockFetchLatestRates.mockResolvedValueOnce({ EUR: 0.85, USD: 1.0 });
		rerender({ apiKey: secondApiKey });

		await waitFor(() => {
			expect(result.current.isLoaded).toBe(true);
		});

		expect(mockFetchCurrencies).toHaveBeenCalledTimes(2);
		expect(mockFetchCurrencies).toHaveBeenLastCalledWith(secondApiKey);
	});

	it("R1 does not retry the same failed key automatically but allows a manual update", async () => {
		mockLoadCurrenciesFromCache.mockReturnValue(null);
		mockFetchCurrencies.mockResolvedValue(null);
		mockFetchLatestRates.mockResolvedValue({ USD: 1.0 });

		const { result } = renderHook(() => useCurrencies(validApiKey));

		await waitFor(() => {
			expect(result.current.updateError).not.toBeNull();
		});

		// Give the auto-load effect several chances to loop before asserting.
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 50));
		});

		expect(mockFetchCurrencies).toHaveBeenCalledTimes(1);

		await act(async () => {
			await result.current.updateCurrencies();
		});

		expect(mockFetchCurrencies).toHaveBeenCalledTimes(2);
	});

	it("reports a generic error message when the fetch rejects with a non-Error", async () => {
		mockLoadCurrenciesFromCache.mockReturnValue(null);
		mockFetchCurrencies.mockImplementation(() => Promise.reject("boom"));
		mockFetchLatestRates.mockResolvedValue({ USD: 1.0 });

		const { result } = renderHook(() => useCurrencies(validApiKey));

		await waitFor(() => {
			expect(result.current.updateError).toBe("Unknown error");
		});
	});
});
