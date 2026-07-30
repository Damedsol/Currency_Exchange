import type { ConversionHistoryEntry, CurrencyMetadata } from "../types";

/**
 * Fetches the API key from localStorage.
 * @returns {string | null} The API key if found, otherwise null.
 */
export function localStorageFetchService(): string | null {
	try {
		const apiKey = localStorage.getItem("apiKey");
		// Trim whitespace from the fetched key before returning
		return apiKey ? apiKey.trim() : null;
	} catch (error) {
		console.error("Error fetching API key from localStorage:", error);
		// Return null on error to indicate failure without crashing.
		return null;
	}
}

/**
 * Stores the API key in localStorage.
 * @param {string} apiKey The API key to store.
 * @returns {void}
 * @throws {Error} If the API key is empty or if an error occurs during the store operation.
 */

// Regular expression to validate the API key format (Updated to 40 characters)
export const apiKeyRegex = /^fca_live_[a-zA-Z0-9]{40}$/;

export function localStorageStoreService(apiKey: string): void {
	try {
		if (!apiKey) {
			throw new Error("API key cannot be empty.");
		}
		// Validate the format
		const isValid = apiKeyRegex.test(apiKey);
		if (!isValid) {
			throw new Error(
				"Invalid API key format. It should start with 'fca_live_' followed by 40 alphanumeric characters.",
			);
		}
		localStorage.setItem("apiKey", apiKey);
	} catch (error) {
		console.error("Error storing API key in localStorage:", error);
		// Re-throw the error to allow calling code to handle it.
		throw new Error(
			`Failed to store API key: ${error instanceof Error ? error.message : String(error)}`,
			{ cause: error },
		);
	}
}

/**
 * Clears the API key from localStorage and reloads the page.
 * Note: Reloading the page might be better handled by the UI component that calls this function.
 * @returns {void}
 * @throws {Error} If an error occurs during the clear operation.
 */
export function clearLocalStorage(): void {
	try {
		// Use removeItem for targeted removal instead of clear()
		localStorage.removeItem("apiKey");
		localStorage.removeItem(RATES_CACHE_KEY); // Clear rates cache too
		localStorage.removeItem(CURRENCIES_CACHE_KEY); // Clear currencies cache too
	} catch (error) {
		console.error("Error clearing API key from localStorage:", error);
		// Re-throw the error.
		throw new Error(
			`Failed to clear API key: ${error instanceof Error ? error.message : String(error)}`,
			{ cause: error },
		);
	}
}

// --- Currency Rates Cache Service Functions ---

const RATES_CACHE_KEY = "currencyRatesCache";
// Cache expiration time: 24 hours in milliseconds
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

// Structure for the cached data
interface CurrencyRatesCache {
	timestamp: number;
	rates: Record<string, number>; // e.g., { 'USD': 1.0, 'EUR': 0.9, ... }
}

/**
 * Saves the fetched currency rates and the current timestamp to localStorage.
 * @param {Record<string, number>} rates The currency rates object to cache.
 * @returns {void}
 */
export function saveRatesToCache(rates: Record<string, number>): void {
	try {
		const cacheData: CurrencyRatesCache = {
			timestamp: Date.now(),
			rates,
		};
		localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(cacheData));
	} catch (error) {
		console.error("Error saving currency rates to cache:", error);
		// Decide if you want to throw or just log the error
	}
}

/**
 * Loads the currency rates from localStorage cache.
 * @returns {Record<string, number> | null} The cached rates if found and not expired, otherwise null.
 */
export function loadRatesFromCache(): Record<string, number> | null {
	try {
		const storedCache = localStorage.getItem(RATES_CACHE_KEY);
		if (storedCache) {
			const parsedCache: CurrencyRatesCache = JSON.parse(storedCache);

			// Check if cache structure is valid and has rates
			if (
				parsedCache &&
				typeof parsedCache === "object" &&
				typeof parsedCache.timestamp === "number" &&
				typeof parsedCache.rates === "object" &&
				parsedCache.rates !== null
			) {
				const now = Date.now();
				// Check if cache has expired
				if (now - parsedCache.timestamp < CACHE_EXPIRATION_TIME) {
					return parsedCache.rates;
				}
				if (import.meta.env.DEV) console.log("Currency rates cache expired.");
			} else {
				console.warn("Invalid rates cache format found in localStorage.");
			}
		}
		return null; // Return null if no valid cache found or expired
	} catch (error) {
		console.error("Error loading currency rates from cache:", error);
		return null; // Return null on error
	}
}

/**
 * Clears the currency rates cache from localStorage.
 * @returns {void}
 */
export function clearRatesCache(): void {
	try {
		localStorage.removeItem(RATES_CACHE_KEY);
		if (import.meta.env.DEV) console.log("Currency rates cache cleared.");
	} catch (error) {
		console.error("Error clearing currency rates cache:", error);
		// Decide if you want to throw or just log the error
	}
}

// --- Currency Metadata Cache Service Functions ---

const CURRENCIES_CACHE_KEY = "currencyMetadataCache";
// Cache expiration time: 7 days in milliseconds
const CURRENCIES_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

// Structure for the cached currency metadata
interface CurrencyMetadataCache {
	timestamp: number;
	currencies: Record<string, CurrencyMetadata>;
}

/**
 * Saves the currency metadata to localStorage.
 * @param currencies The currency metadata object to cache.
 * @returns {void}
 */
export function saveCurrenciesToCache(
	currencies: Record<string, CurrencyMetadata>,
): void {
	try {
		const cacheData: CurrencyMetadataCache = {
			timestamp: Date.now(),
			currencies,
		};
		localStorage.setItem(CURRENCIES_CACHE_KEY, JSON.stringify(cacheData));
	} catch (error) {
		console.error("Error saving currency metadata to cache:", error);
	}
}

/**
 * Loads the currency metadata from localStorage cache.
 * @returns The cached currency metadata if found and not expired, otherwise null.
 */
export function loadCurrenciesFromCache(): Record<
	string,
	CurrencyMetadata
> | null {
	try {
		const storedCache = localStorage.getItem(CURRENCIES_CACHE_KEY);
		if (storedCache) {
			const parsedCache: CurrencyMetadataCache = JSON.parse(storedCache);

			if (
				parsedCache &&
				typeof parsedCache === "object" &&
				typeof parsedCache.timestamp === "number" &&
				typeof parsedCache.currencies === "object" &&
				parsedCache.currencies !== null
			) {
				const now = Date.now();
				if (now - parsedCache.timestamp < CURRENCIES_CACHE_TTL) {
					return parsedCache.currencies;
				}
				if (import.meta.env.DEV)
					console.log("Currency metadata cache expired.");
			} else {
				console.warn(
					"Invalid currency metadata cache format found in localStorage.",
				);
			}
		}
		return null;
	} catch (error) {
		console.error("Error loading currency metadata from cache:", error);
		return null;
	}
}

/**
 * Clears the currency metadata cache from localStorage.
 * @returns {void}
 */
export function clearCurrenciesCache(): void {
	try {
		localStorage.removeItem(CURRENCIES_CACHE_KEY);
		if (import.meta.env.DEV) console.log("Currency metadata cache cleared.");
	} catch (error) {
		console.error("Error clearing currency metadata cache:", error);
	}
}

// --- Conversion History Service Functions ---

const HISTORY_STORAGE_KEY = "conversionHistory";
const MAX_HISTORY_LENGTH = 10; // Keep the last 10 conversions

/**
 * Saves the conversion history to localStorage.
 * @param {ConversionHistoryEntry[]} history The history array to save.
 * @returns {void}
 */
export function saveConversionHistoryService(
	history: ConversionHistoryEntry[],
): void {
	try {
		// Ensure we only save the last MAX_HISTORY_LENGTH items
		const historyToSave = history.slice(0, MAX_HISTORY_LENGTH);
		localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyToSave));
	} catch (error) {
		console.error("Error saving conversion history to localStorage:", error);
		// Decide if you want to throw or just log the error
	}
}

/**
 * Loads the conversion history from localStorage.
 * @returns {ConversionHistoryEntry[]} The loaded history array, or an empty array if not found or error.
 */
export function loadConversionHistoryService(): ConversionHistoryEntry[] {
	try {
		const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
		if (storedHistory) {
			const parsedHistory = JSON.parse(storedHistory);
			// Basic validation to ensure it's an array
			if (Array.isArray(parsedHistory)) {
				return parsedHistory;
			}
			console.warn(
				"Invalid history format found in localStorage. Returning empty array.",
			);
			return [];
		}
		return []; // Return empty array if no history is found
	} catch (error) {
		console.error("Error loading conversion history from localStorage:", error);
		return []; // Return empty array on error
	}
}
