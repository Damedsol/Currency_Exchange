import { describe, expect, it, vi, beforeEach } from "vitest";
import {
	apiKeyRegex,
	localStorageFetchService,
	localStorageStoreService,
	clearLocalStorage,
	saveRatesToCache,
	loadRatesFromCache,
	clearRatesCache,
	saveConversionHistoryService,
	loadConversionHistoryService,
} from "./LocalStorage";

beforeEach(() => {
	localStorage.clear();
	vi.restoreAllMocks();
});

const validKey = "fca_live_abcdefghijklmnopqrstuvwxyz0123456789abcd";

describe("apiKeyRegex", () => {
	it("matches valid freecurrencyapi key", () => {
		expect(apiKeyRegex.test(validKey)).toBe(true);
	});

	it("rejects key without fca_live_ prefix", () => {
		expect(apiKeyRegex.test("invalid_key_12345")).toBe(false);
	});

	it("rejects key shorter than 40 chars", () => {
		expect(apiKeyRegex.test("fca_live_short")).toBe(false);
	});
});

describe("localStorageFetchService", () => {
	it("returns null when no key stored", () => {
		expect(localStorageFetchService()).toBeNull();
	});

	it("returns trimmed API key when stored", () => {
		localStorage.setItem("apiKey", `  ${validKey}  `);
		expect(localStorageFetchService()).toBe(validKey);
	});
});

describe("localStorageStoreService", () => {
	it("stores a valid API key", () => {
		localStorageStoreService(validKey);
		expect(localStorage.getItem("apiKey")).toBe(validKey);
	});

	it("throws on empty key", () => {
		expect(() => localStorageStoreService("")).toThrow(
			"API key cannot be empty",
		);
	});

	it("throws on invalid format", () => {
		expect(() => localStorageStoreService("invalid")).toThrow(
			"Invalid API key format",
		);
	});
});

describe("clearLocalStorage", () => {
	it("removes apiKey and rates cache", () => {
		localStorage.setItem("apiKey", "test");
		localStorage.setItem("currencyRatesCache", "{}");
		clearLocalStorage();
		expect(localStorage.getItem("apiKey")).toBeNull();
		expect(localStorage.getItem("currencyRatesCache")).toBeNull();
	});
});

describe("rates cache", () => {
	it("saves and loads rates", () => {
		const rates = { USD: 1.0, EUR: 0.9 };
		saveRatesToCache(rates);
		const loaded = loadRatesFromCache();
		expect(loaded).toEqual(rates);
	});

	it("returns null when cache is empty", () => {
		expect(loadRatesFromCache()).toBeNull();
	});

	it("clears rates cache", () => {
		saveRatesToCache({ USD: 1.0 });
		clearRatesCache();
		expect(loadRatesFromCache()).toBeNull();
	});
});

describe("conversion history", () => {
	const entry = {
		fromCurrency: "USD",
		toCurrency: "EUR",
		amount: 100,
		rate: 0.925,
		result: 92.5,
		timestamp: Date.now(),
	};

	it("saves and loads history", () => {
		saveConversionHistoryService([entry]);
		const loaded = loadConversionHistoryService();
		expect(loaded).toHaveLength(1);
		expect(loaded[0]!.fromCurrency).toBe("USD");
	});

	it("returns empty array when no history saved", () => {
		expect(loadConversionHistoryService()).toEqual([]);
	});

	it("limits history to 10 entries", () => {
		const entries = Array.from({ length: 15 }, (_, i) => ({
			...entry,
			timestamp: Date.now() + i,
			amount: 100 + i,
		}));
		saveConversionHistoryService(entries);
		const loaded = loadConversionHistoryService();
		expect(loaded).toHaveLength(10);
	});
});
