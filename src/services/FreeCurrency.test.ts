// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrencyRate } from "./FreeCurrency";

const validApiKey = "fca_live_test1234567890123456789012345678901234";
const mockRates = { EUR: 0.85, GBP: 0.73, JPY: 110.0 };

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
});
