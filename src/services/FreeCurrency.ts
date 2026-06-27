import type { CurrencyMetadata } from "../types";
import { loadRatesFromCache, saveRatesToCache } from "./LocalStorage";

// Define the structure for the return value, including the source
export interface CurrencyRateResult {
	rate: number | null;
	source: "cache" | "api" | "error";
}

// Define arguments, ensuring types are strings
interface GetCurrencyRateArgs {
	fromCurrency: string;
	toCurrency: string;
	apiKey: string;
}

const RATES_API_URL = "https://api.freecurrencyapi.com/v1/latest";
const CURRENCIES_API_URL = "https://api.freecurrencyapi.com/v1/currencies";
const BASE_CURRENCY = "USD"; // Using USD as the base for caching

// In-memory cache to avoid repeated JSON.parse of localStorage
const memoryCache: Map<
	string,
	{ rates: Record<string, number>; timestamp: number }
> = new Map();
const MEMORY_CACHE_TTL = 300_000; // 5 minutes

/**
 * Fetches latest exchange rates from the API.
 * Saves rates to localStorage cache before returning.
 * @returns All rates with USD=1.0 added, or null on failure.
 */
export async function fetchLatestRates(
	apiKey: string,
): Promise<Record<string, number> | null> {
	console.log("Fetching fresh rates from API.");
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10_000);
	try {
		const params = `base_currency=${BASE_CURRENCY}`;
		const response = await fetch(`${RATES_API_URL}?${params}`, {
			headers: { apikey: apiKey },
			signal: controller.signal,
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error(
				`API Error (${response.status}): ${errorData.message || "Unknown API error"}`,
			);
			if (response.status === 429) {
				console.error("API quota exceeded. Try again later.");
			}
			return null;
		}

		const data = await response.json();

		if (!data || typeof data.data !== "object" || data.data === null) {
			console.error("Invalid data structure received from API:", data);
			return null;
		}

		const rates = data.data as Record<string, number>;
		rates[BASE_CURRENCY] = 1.0;

		saveRatesToCache(rates);
		console.log("Rates saved to cache (localStorage).");

		return rates;
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			console.error("API request timed out after 10 seconds.");
		} else {
			console.error("Network or other error fetching currency rates:", error);
		}
		return null;
	} finally {
		clearTimeout(timeoutId);
	}
}

/**
 * Fetches currency metadata (names, symbols, decimal_digits) from the API.
 * @returns Record of currency codes to CurrencyMetadata, or null on failure.
 */
export async function fetchCurrencies(
	apiKey: string,
): Promise<Record<string, CurrencyMetadata> | null> {
	console.log("Fetching currencies from API.");
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10_000);
	try {
		const response = await fetch(CURRENCIES_API_URL, {
			headers: { apikey: apiKey },
			signal: controller.signal,
		});

		if (!response.ok) {
			console.error(`API Error fetching currencies (${response.status})`);
			return null;
		}

		const data = await response.json();

		if (!data || typeof data.data !== "object" || data.data === null) {
			console.error(
				"Invalid currencies data structure received from API:",
				data,
			);
			return null;
		}

		const currencies = data.data as Record<string, CurrencyMetadata>;

		// Validate required fields for at least one currency entry
		const entries = Object.entries(currencies);
		if (entries.length > 0) {
			for (const [code, meta] of entries) {
				if (
					!meta ||
					typeof meta.symbol !== "string" ||
					typeof meta.code !== "string" ||
					typeof meta.decimal_digits !== "number"
				) {
					console.error(
						`Invalid currency metadata for ${code}: missing required fields.`,
					);
					return null;
				}
			}
		}

		return currencies;
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			console.error("Currencies API request timed out after 10 seconds.");
		} else {
			console.error("Network or other error fetching currencies:", error);
		}
		return null;
	} finally {
		clearTimeout(timeoutId);
	}
}

export const getCurrencyRate = async ({
	fromCurrency,
	toCurrency,
	apiKey,
}: GetCurrencyRateArgs): Promise<CurrencyRateResult> => {
	if (!apiKey || !fromCurrency || !toCurrency) {
		console.error("API key and currencies must be provided.");
		return { rate: null, source: "error" };
	}

	// 1. Try in-memory cache first
	const cacheKey = `${fromCurrency}-${toCurrency}`;
	const memoryEntry = memoryCache.get(cacheKey);
	if (memoryEntry && Date.now() - memoryEntry.timestamp < MEMORY_CACHE_TTL) {
		return { rate: memoryEntry.rates[toCurrency] ?? null, source: "cache" };
	}

	// 2. Try loading from localStorage cache
	const cachedRates = loadRatesFromCache();

	if (cachedRates) {
		console.log("Using cached rates.");
		const rate = calculateRate(cachedRates, fromCurrency, toCurrency);
		if (rate !== null) {
			return { rate, source: "cache" };
		} else {
			console.warn(
				`Could not calculate rate ${fromCurrency} -> ${toCurrency} from cache. Fetching fresh data.`,
			);
		}
	}

	// 3. Fetch from API via extracted helper
	const rates = await fetchLatestRates(apiKey);
	if (!rates) {
		return { rate: null, source: "error" };
	}

	// Update in-memory cache
	memoryCache.set(cacheKey, {
		rates,
		timestamp: Date.now(),
	});
	console.log("Rates saved to memory cache.");

	// Calculate the requested rate from the fresh data
	const rate = calculateRate(rates, fromCurrency, toCurrency);
	if (rate !== null) {
		return { rate, source: "api" };
	} else {
		console.error(
			`Could not calculate rate ${fromCurrency} -> ${toCurrency} from newly fetched data.`,
		);
		return { rate: null, source: "error" };
	}
};

/**
 * Calculates the conversion rate between two currencies using a base currency (USD).
 * rate(A -> B) = rate(USD -> B) / rate(USD -> A)
 * @param rates Rates object relative to the BASE_CURRENCY (USD).
 * @param fromCurrency The source currency code (e.g., 'EUR').
 * @param toCurrency The target currency code (e.g., 'JPY').
 * @returns The calculated rate, or null if calculation is not possible.
 */
function calculateRate(
	rates: Record<string, number>,
	fromCurrency: string,
	toCurrency: string,
): number | null {
	if (
		!rates ||
		typeof rates !== "object" ||
		!rates[fromCurrency] ||
		!rates[toCurrency]
	) {
		console.warn(
			`Cannot calculate rate: Missing rate for ${fromCurrency} or ${toCurrency} in provided data.`,
		);
		return null;
	}

	if (fromCurrency === toCurrency) {
		return 1.0;
	}

	// Calculate using USD as the base
	const fromRate = rates[fromCurrency]; // Rate USD -> fromCurrency
	const toRate = rates[toCurrency]; // Rate USD -> toCurrency

	if (fromRate === 0) {
		console.error(`Cannot calculate rate: Rate for ${fromCurrency} is zero.`);
		return null;
	}

	// The rate fromCurrency -> toCurrency is (USD -> toCurrency) / (USD -> fromCurrency)
	return toRate / fromRate;
}
