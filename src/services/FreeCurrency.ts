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

const API_URL = "https://api.freecurrencyapi.com/v1/latest";
const BASE_CURRENCY = "USD"; // Using USD as the base for caching

// In-memory cache to avoid repeated JSON.parse of localStorage
const memoryCache: Map<
	string,
	{ rates: Record<string, number>; timestamp: number }
> = new Map();
const MEMORY_CACHE_TTL = 300_000; // 5 minutes

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
			// Invalidate local reference if calculation fails
		}
	}

	// 2. Fetch from API if cache is invalid or calculation failed
	console.log("Fetching fresh rates from API.");
	try {
		// Fetch all currencies based on USD (API key in header via Kong)
		const params = `base_currency=${BASE_CURRENCY}`;
		const response = await fetch(`${API_URL}?${params}`, {
			headers: { apikey: apiKey },
		});

		if (!response.ok) {
			// Handle API errors (like rate limits, invalid key)
			const errorData = await response.json();
			console.error(
				`API Error (${response.status}): ${errorData.message || "Unknown API error"}`,
			);
			// Check for specific quota exceeded errors
			if (response.status === 429) {
				console.error("API quota exceeded. Try again later.");
				// Optionally, inform the user more directly
			}
			return { rate: null, source: "error" };
		}

		const data = await response.json();

		// Ensure data.data exists and is an object
		if (!data || typeof data.data !== "object" || data.data === null) {
			console.error("Invalid data structure received from API:", data);
			return { rate: null, source: "error" };
		}

		const rates = data.data as Record<string, number>;

		// Add the base currency rate (which is 1)
		rates[BASE_CURRENCY] = 1.0;

		// Save the fresh rates to cache (memory + localStorage)
		saveRatesToCache(rates);
		memoryCache.set(fromCurrency + "-" + toCurrency, {
			rates,
			timestamp: Date.now(),
		});
		console.log("Rates saved to cache (memory + storage).");

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
	} catch (error) {
		console.error("Network or other error fetching currency rates:", error);
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
