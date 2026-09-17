import { useCallback, useEffect, useRef, useState } from "react";

import { fetchCurrencies, fetchLatestRates } from "../services/FreeCurrency";
import {
	loadCurrenciesFromCache,
	saveCurrenciesToCache,
} from "../services/LocalStorage";
import type { CurrencyMetadata } from "../types";

export interface UseCurrenciesReturn {
	currencies: Record<string, CurrencyMetadata>;
	isLoaded: boolean;
	isUpdating: boolean;
	lastUpdated: number | null;
	updateError: string | null;
	updateCurrencies: () => Promise<void>;
}

export function useCurrencies(
	storedApiKey: string | null,
): UseCurrenciesReturn {
	const [currencies, setCurrencies] = useState<
		Record<string, CurrencyMetadata>
	>(() => {
		return loadCurrenciesFromCache() ?? {};
	});

	const [isLoaded, setIsLoaded] = useState(() => {
		return loadCurrenciesFromCache() !== null;
	});

	const [isUpdating, setIsUpdating] = useState(false);
	const [lastUpdated, setLastUpdated] = useState<number | null>(null);
	const [updateError, setUpdateError] = useState<string | null>(null);

	// Last API key that triggered an automatic load (R1): one attempt per distinct
	// key, so a failure never turns into a retry loop and StrictMode's double
	// effect invocation can't double-fetch.
	const autoLoadKeyRef = useRef<string | null>(null);

	const updateCurrencies = useCallback(async () => {
		if (!storedApiKey) {
			return;
		}

		setIsUpdating(true);
		setUpdateError(null);

		try {
			const [newCurrencies] = await Promise.all([
				fetchCurrencies(storedApiKey),
				fetchLatestRates(storedApiKey),
			]);

			if (newCurrencies) {
				saveCurrenciesToCache(newCurrencies);
				setCurrencies(newCurrencies);
				setIsLoaded(true);
				setLastUpdated(Date.now());
			} else {
				setUpdateError("Failed to fetch currency data from API.");
			}
		} catch (error: unknown) {
			setUpdateError(error instanceof Error ? error.message : "Unknown error");
		} finally {
			setIsUpdating(false);
		}
	}, [storedApiKey]);

	// Load currencies as soon as an API key is available and no cached metadata
	// is loaded yet; a different key triggers a new automatic attempt.
	useEffect(() => {
		if (!storedApiKey) {
			autoLoadKeyRef.current = null;
			return;
		}

		if (isLoaded || isUpdating) {
			return;
		}

		if (autoLoadKeyRef.current === storedApiKey) {
			return;
		}

		autoLoadKeyRef.current = storedApiKey;
		void updateCurrencies();
	}, [storedApiKey, isLoaded, isUpdating, updateCurrencies]);

	return {
		currencies,
		isLoaded,
		isUpdating,
		lastUpdated,
		updateError,
		updateCurrencies,
	};
}
