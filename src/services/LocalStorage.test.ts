import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	apiKeyRegex,
	clearLocalStorage,
	clearRatesCache,
	loadConversionHistoryService,
	loadRatesFromCache,
	localStorageFetchService,
	localStorageStoreService,
	saveConversionHistoryService,
	saveRatesToCache,
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

	it("does not remove unrelated localStorage keys", () => {
		localStorage.setItem("apiKey", "test");
		localStorage.setItem("currencyRatesCache", "{}");
		localStorage.setItem("unrelatedKey", "shouldPersist");
		clearLocalStorage();
		expect(localStorage.getItem("unrelatedKey")).toBe("shouldPersist");
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

	it("saves rates with a timestamp", () => {
		const rates = { USD: 1.0 };
		saveRatesToCache(rates);
		const stored = localStorage.getItem("currencyRatesCache");
		expect(stored).not.toBeNull();
		const parsed = JSON.parse(stored as string);
		expect(parsed).toHaveProperty("timestamp");
		expect(typeof parsed.timestamp).toBe("number");
		expect(parsed).toHaveProperty("rates");
		expect(parsed.rates).toEqual(rates);
	});

	it("returns null for expired cache", () => {
		// Manually set an expired cache entry (25 hours old, exceeds 24h TTL)
		const expired = {
			timestamp: Date.now() - 25 * 60 * 60 * 1000,
			rates: { USD: 1.0 },
		};
		localStorage.setItem("currencyRatesCache", JSON.stringify(expired));
		expect(loadRatesFromCache()).toBeNull();
	});

	it("returns null for corrupted cache JSON", () => {
		localStorage.setItem("currencyRatesCache", "not-valid-json");
		expect(loadRatesFromCache()).toBeNull();
	});

	it("returns null for invalid cache structure", () => {
		localStorage.setItem(
			"currencyRatesCache",
			JSON.stringify({ invalid: "structure" }),
		);
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

	it("returns empty array when stored history is not an array", () => {
		localStorage.setItem("conversionHistory", JSON.stringify({ not: "array" }));
		expect(loadConversionHistoryService()).toEqual([]);
	});

	it("returns empty array when history JSON is corrupted", () => {
		localStorage.setItem("conversionHistory", "corrupted-json{{{");
		expect(loadConversionHistoryService()).toEqual([]);
	});

	it("clearLocalStorage handles storage errors gracefully", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.stubGlobal(
			"localStorage",
			Object.assign({}, localStorage, {
				removeItem: vi.fn(() => {
					throw new Error("Storage access denied");
				}),
			}),
		);
		expect(() => clearLocalStorage()).toThrow();
		consoleSpy.mockRestore();
		vi.unstubAllGlobals();
	});

	it("saveRatesToCache handles storage errors gracefully", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.stubGlobal(
			"localStorage",
			Object.assign({}, localStorage, {
				setItem: vi.fn(() => {
					throw new Error("Quota exceeded");
				}),
			}),
		);
		saveRatesToCache({ USD: 1.0 });
		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
		vi.unstubAllGlobals();
	});

	it("clearRatesCache handles storage errors gracefully", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.stubGlobal(
			"localStorage",
			Object.assign({}, localStorage, {
				removeItem: vi.fn(() => {
					throw new Error("Storage access denied");
				}),
			}),
		);
		clearRatesCache();
		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
		vi.unstubAllGlobals();
	});

	it("saveConversionHistoryService handles storage errors gracefully", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.stubGlobal(
			"localStorage",
			Object.assign({}, localStorage, {
				setItem: vi.fn(() => {
					throw new Error("Quota exceeded");
				}),
			}),
		);
		saveConversionHistoryService([]);
		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
		vi.unstubAllGlobals();
	});

	it("localStorageFetchService handles storage errors gracefully", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.stubGlobal(
			"localStorage",
			Object.assign({}, localStorage, {
				getItem: vi.fn(() => {
					throw new Error("Storage access denied");
				}),
			}),
		);
		const result = localStorageFetchService();
		expect(result).toBeNull();
		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
		vi.unstubAllGlobals();
	});
});
