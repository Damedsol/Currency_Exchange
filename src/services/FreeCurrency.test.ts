// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	fetchCurrencies,
	fetchLatestRates,
	getCurrencyRate,
} from "./FreeCurrency";

const validApiKey = "fca_live_test1234567890123456789012345678901234";
const mockRates = { EUR: 0.85, GBP: 0.73, JPY: 110.0 };

const mockCurrencies = {
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

function mockFetchOnce(data: Record<string, number>, ok = true): void {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({
			ok,
			json: () => Promise.resolve({ data }),
		}),
	);
}

function mockFetchRejects(error: Error): void {
	vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));
}

function mockFetchCapture(): { url: string; headers: Record<string, string> } {
	const capture = { url: "", headers: {} as Record<string, string> };
	vi.stubGlobal(
		"fetch",
		vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
			capture.url = url;
			capture.headers = (opts?.headers as Record<string, string>) || {};
			return Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ data: mockRates }),
			});
		}),
	);
	return capture;
}

beforeEach(() => {
	vi.restoreAllMocks();
	localStorage.clear();
});

describe("FreeCurrency service", () => {
	it("returns null when API key is empty", async () => {
		const result = await getCurrencyRate({
			fromCurrency: "EUR",
			toCurrency: "USD",
			apiKey: "",
		});
		expect(result.rate).toBeNull();
		expect(result.source).toBe("error");
	});

	it("returns 1.0 from localStorage cache for same currency", async () => {
		localStorage.setItem(
			"currencyRatesCache",
			JSON.stringify({ rates: mockRates, timestamp: Date.now() }),
		);
		const result = await getCurrencyRate({
			fromCurrency: "EUR",
			toCurrency: "EUR",
			apiKey: validApiKey,
		});
		expect(result.rate).toBe(1.0);
	});

	it("returns error on HTTP 429 rate limit", async () => {
		mockFetchOnce({}, false);
		const result = await getCurrencyRate({
			fromCurrency: "AUD",
			toCurrency: "NZD",
			apiKey: validApiKey,
		});
		expect(result.rate).toBeNull();
		expect(result.source).toBe("error");
	});

	it("returns error on network failure", async () => {
		mockFetchRejects(new Error("Network failure"));
		const result = await getCurrencyRate({
			fromCurrency: "CHF",
			toCurrency: "SEK",
			apiKey: validApiKey,
		});
		expect(result.rate).toBeNull();
		expect(result.source).toBe("error");
	});

	it("returns null when fromCurrency rate is missing from API data", async () => {
		mockFetchOnce(mockRates);
		const result = await getCurrencyRate({
			fromCurrency: "XYZ",
			toCurrency: "USD",
			apiKey: validApiKey,
		});
		expect(result.rate).toBeNull();
	});

	it("calculates EUR to USD rate via API", async () => {
		mockFetchOnce(mockRates);
		const result = await getCurrencyRate({
			fromCurrency: "EUR",
			toCurrency: "USD",
			apiKey: validApiKey,
		});
		expect(result.rate).toBeCloseTo(1.176, 2);
		expect(result.source).toBe("api");
	});

	it("uses in-memory cache on repeated call within TTL", async () => {
		mockFetchOnce(mockRates);
		await getCurrencyRate({
			fromCurrency: "GBP",
			toCurrency: "JPY",
			apiKey: validApiKey,
		});
		const result = await getCurrencyRate({
			fromCurrency: "GBP",
			toCurrency: "JPY",
			apiKey: validApiKey,
		});
		expect(result.source).toBe("cache");
	});

	it("calls API with HTTPS URL", async () => {
		const capture = mockFetchCapture();
		await getCurrencyRate({
			fromCurrency: "CAD",
			toCurrency: "MXN",
			apiKey: validApiKey,
		});
		expect(capture.url).toMatch(/^https:\/\//);
	});

	it("sends API key as HTTP header not query param", async () => {
		const capture = mockFetchCapture();
		await getCurrencyRate({
			fromCurrency: "BRL",
			toCurrency: "ARS",
			apiKey: validApiKey,
		});
		expect(capture.headers.apikey).toBe(validApiKey);
		expect(capture.url).not.toContain("apikey");
	});

	it("returns error when API returns invalid data structure", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ notData: "invalid" }),
			}),
		);
		const result = await getCurrencyRate({
			fromCurrency: "AAA",
			toCurrency: "BBB",
			apiKey: validApiKey,
		});
		expect(result.rate).toBeNull();
		expect(result.source).toBe("error");
	});

	it("returns error when fromCurrency rate is zero", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ data: { ZZZ: 0, USD: 1.0 } }),
			}),
		);
		const result = await getCurrencyRate({
			fromCurrency: "ZZZ",
			toCurrency: "USD",
			apiKey: validApiKey,
		});
		expect(result.rate).toBeNull();
		expect(result.source).toBe("error");
	});

	it("returns error on AbortError (timeout)", async () => {
		const abortError = new DOMException(
			"The operation was aborted",
			"AbortError",
		);
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));
		const result = await getCurrencyRate({
			fromCurrency: "CCC",
			toCurrency: "DDD",
			apiKey: validApiKey,
		});
		expect(result.rate).toBeNull();
		expect(result.source).toBe("error");
	});

	it("falls through to API when cache exists but cannot calculate pair", async () => {
		// Set up localStorage cache with missing currency pair
		const missingPairCache = { EUR: 0.85, GBP: 0.73 };
		localStorage.setItem(
			"currencyRatesCache",
			JSON.stringify({
				timestamp: Date.now(),
				rates: missingPairCache,
			}),
		);
		mockFetchOnce(mockRates);
		const result = await getCurrencyRate({
			fromCurrency: "EUR",
			toCurrency: "JPY",
			apiKey: validApiKey,
		});
		expect(result.source).toBe("api");
		expect(result.rate).toBeCloseTo(mockRates.JPY / mockRates.EUR, 2);
	});

	it("triggers abort timeout callback after 10 seconds", {
		timeout: 20000,
	}, async () => {
		vi.useFakeTimers();
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		let abortSignal: AbortSignal | null = null;
		vi.stubGlobal(
			"fetch",
			vi.fn((_url: string, opts?: RequestInit) => {
				abortSignal = opts?.signal ?? null;
				// Create a promise that rejects when the signal is aborted
				return new Promise((_resolve, reject) => {
					if (abortSignal) {
						abortSignal.addEventListener("abort", () => {
							reject(new DOMException("Aborted", "AbortError"));
						});
					}
				});
			}),
		);
		const promise = getCurrencyRate({
			fromCurrency: "USD",
			toCurrency: "EUR",
			apiKey: validApiKey,
		});
		// Advance past the 10 second timeout to trigger the abort
		await vi.advanceTimersByTimeAsync(10001);
		const result = await promise;
		expect(result.rate).toBeNull();
		expect(result.source).toBe("error");
		expect(consoleSpy).toHaveBeenCalledWith(
			"API request timed out after 10 seconds.",
		);
		consoleSpy.mockRestore();
		vi.useRealTimers();
	});

	it("logs quota message on 429 status", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: false,
				status: 429,
				json: () => Promise.resolve({ message: "Quota exceeded" }),
			}),
		);
		const result = await getCurrencyRate({
			fromCurrency: "USD",
			toCurrency: "EUR",
			apiKey: validApiKey,
		});
		expect(result.rate).toBeNull();
		expect(result.source).toBe("error");
		expect(consoleSpy).toHaveBeenCalledWith(
			"API quota exceeded. Try again later.",
		);
		consoleSpy.mockRestore();
	});
});

describe("fetchLatestRates", () => {
	it("returns rates with USD base on successful fetch", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ data: { EUR: 0.85, JPY: 110 } }),
			}),
		);
		const rates = await fetchLatestRates(validApiKey);
		expect(rates).not.toBeNull();
		expect(rates).toHaveProperty("USD", 1.0);
		expect(rates).toHaveProperty("EUR", 0.85);
	});

	it("returns null on HTTP error", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: false,
				status: 401,
				json: () => Promise.resolve({ message: "Unauthorized" }),
			}),
		);
		const rates = await fetchLatestRates(validApiKey);
		expect(rates).toBeNull();
	});

	it("returns null on invalid data structure", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ notData: "invalid" }),
			}),
		);
		const rates = await fetchLatestRates(validApiKey);
		expect(rates).toBeNull();
	});

	it("returns null on network failure", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockRejectedValue(new Error("Network failure")),
		);
		const rates = await fetchLatestRates(validApiKey);
		expect(rates).toBeNull();
	});

	it("saves rates to localStorage cache", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ data: { EUR: 0.85 } }),
			}),
		);
		await fetchLatestRates(validApiKey);
		const cached = localStorage.getItem("currencyRatesCache");
		expect(cached).not.toBeNull();
		const parsed = JSON.parse(cached!);
		expect(parsed.rates).toHaveProperty("USD", 1.0);
	});

	it("sends API key as HTTP header", async () => {
		const capture: { headers: Record<string, string> } = {
			headers: {} as Record<string, string>,
		};
		vi.stubGlobal(
			"fetch",
			vi.fn((_url: string, opts?: RequestInit) => {
				capture.headers = (opts?.headers as Record<string, string>) || {};
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ data: { EUR: 0.85 } }),
				});
			}),
		);
		await fetchLatestRates(validApiKey);
		expect(capture.headers.apikey).toBe(validApiKey);
	});

	it("triggers abort timeout after 10 seconds", {
		timeout: 20000,
	}, async () => {
		vi.useFakeTimers();
		let abortSignal: AbortSignal | null = null;
		vi.stubGlobal(
			"fetch",
			vi.fn((_url: string, opts?: RequestInit) => {
				abortSignal = opts?.signal ?? null;
				return new Promise((_resolve, reject) => {
					if (abortSignal) {
						abortSignal.addEventListener("abort", () => {
							reject(new DOMException("Aborted", "AbortError"));
						});
					}
				});
			}),
		);
		const promise = fetchLatestRates(validApiKey);
		await vi.advanceTimersByTimeAsync(10001);
		const rates = await promise;
		expect(rates).toBeNull();
		vi.useRealTimers();
	});
});

describe("fetchCurrencies", () => {
	it("returns currency metadata on successful fetch", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ data: mockCurrencies }),
			}),
		);
		const currencies = await fetchCurrencies(validApiKey);
		expect(currencies).not.toBeNull();
		expect(currencies).toHaveProperty("USD");
		expect(currencies!["USD"]!.code).toBe("USD");
		expect(currencies!["USD"]!.decimal_digits).toBe(2);
		expect(currencies!["JPY"]!.decimal_digits).toBe(0);
	});

	it("returns null on network failure", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockRejectedValue(new Error("Network failure")),
		);
		const currencies = await fetchCurrencies(validApiKey);
		expect(currencies).toBeNull();
	});

	it("sends API key as HTTP header", async () => {
		const capture: { headers: Record<string, string> } = {
			headers: {} as Record<string, string>,
		};
		vi.stubGlobal(
			"fetch",
			vi.fn((_url: string, opts?: RequestInit) => {
				capture.headers = (opts?.headers as Record<string, string>) || {};
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ data: mockCurrencies }),
				});
			}),
		);
		await fetchCurrencies(validApiKey);
		expect(capture.headers.apikey).toBe(validApiKey);
	});

	it("returns null on invalid data structure", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ notData: "invalid" }),
			}),
		);
		const currencies = await fetchCurrencies(validApiKey);
		expect(currencies).toBeNull();
	});

	it("returns null on HTTP error", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				json: () => Promise.resolve({ message: "Server error" }),
			}),
		);
		const currencies = await fetchCurrencies(validApiKey);
		expect(currencies).toBeNull();
	});

	it("returns null when required fields are missing", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({
						data: {
							XXX: { symbol: "X", name: "Test", code: "XXX" },
						},
					}),
			}),
		);
		const currencies = await fetchCurrencies(validApiKey);
		expect(currencies).toBeNull();
	});

	it("triggers abort timeout after 10 seconds", {
		timeout: 20000,
	}, async () => {
		vi.useFakeTimers();
		let abortSignal: AbortSignal | null = null;
		vi.stubGlobal(
			"fetch",
			vi.fn((_url: string, opts?: RequestInit) => {
				abortSignal = opts?.signal ?? null;
				return new Promise((_resolve, reject) => {
					if (abortSignal) {
						abortSignal.addEventListener("abort", () => {
							reject(new DOMException("Aborted", "AbortError"));
						});
					}
				});
			}),
		);
		const promise = fetchCurrencies(validApiKey);
		await vi.advanceTimersByTimeAsync(10001);
		const currencies = await promise;
		expect(currencies).toBeNull();
		vi.useRealTimers();
	});
});
