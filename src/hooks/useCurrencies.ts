import { useCallback, useState } from "react";

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

	return {
		currencies,
		isLoaded,
		isUpdating,
		lastUpdated,
		updateError,
		updateCurrencies,
	};
}
