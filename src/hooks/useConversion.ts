import { useCallback, useState } from "react";
import type React from "react";

import {
	getCurrencyRate,
	type CurrencyRateResult,
} from "../services/FreeCurrency";
import type { ConversionHistoryEntry } from "../services/LocalStorage";
import type { RateSource } from "../types";

export interface UseConversionParams {
	storedApiKey: string | null;
	onConversionComplete: (entry: ConversionHistoryEntry) => void;
	showError: (message: string) => void;
}

export interface UseConversionReturn {
	amount: number;
	fromCurrency: string;
	toCurrency: string;
	rate: number;
	rateSource: RateSource;
	handleFromCurrency: (value: string) => void;
	handleToCurrency: (value: string) => void;
	handleAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	swapCurrencies: () => void;
	fetchRate: () => Promise<void>;
	repeatConversion: (entry: ConversionHistoryEntry) => void;
}

export function useConversion({
	storedApiKey,
	onConversionComplete,
	showError,
}: UseConversionParams): UseConversionReturn {
	const [amount, setAmount] = useState(1000);
	const [fromCurrency, setFromCurrency] = useState("EUR");
	const [toCurrency, setToCurrency] = useState("USD");
	const [rate, setRate] = useState(0);
	const [rateSource, setRateSource] = useState<RateSource>("idle");

	const handleFromCurrency = useCallback((value: string) => {
		setFromCurrency(value);
		setRate(0);
		setRateSource("idle");
	}, []);

	const handleToCurrency = useCallback((value: string) => {
		setToCurrency(value);
		setRate(0);
		setRateSource("idle");
	}, []);

	const handleAmountChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value = Number(event.target.value);
			if (!isNaN(value) && value >= 0) {
				setAmount(value);
			}
			setRate(0);
			setRateSource("idle");
		},
		[],
	);

	const swapCurrencies = useCallback(() => {
		setFromCurrency(toCurrency);
		setToCurrency(fromCurrency);
		setRate(0);
		setRateSource("idle");
	}, [fromCurrency, toCurrency]);

	const fetchRate = useCallback(async () => {
		if (!storedApiKey || amount <= 0 || fromCurrency === toCurrency) {
			setRate(fromCurrency === toCurrency ? 1.0 : 0);
			setRateSource(fromCurrency === toCurrency ? "api" : "idle");
			return;
		}

		setRateSource("loading");
		setRate(0);

		try {
			const result: CurrencyRateResult = await getCurrencyRate({
				fromCurrency,
				toCurrency,
				apiKey: storedApiKey,
			});

			setRateSource(result.source);

			if (result.source !== "error" && typeof result.rate === "number") {
				const currentRate = result.rate;
				const conversionResult = amount * currentRate;
				setRate(currentRate);

				onConversionComplete({
					fromCurrency,
					toCurrency,
					amount,
					rate: currentRate,
					result: conversionResult,
					timestamp: Date.now(),
				});
			} else {
				setRate(0);
				if (result.source === "error") {
					showError(
						"Error fetching currency rate. Check your API key or network connection.",
					);
				}
			}
		} catch {
			setRate(0);
			setRateSource("error");
			showError("An unexpected error occurred while fetching the rate.");
		}
	}, [
		storedApiKey,
		amount,
		fromCurrency,
		toCurrency,
		onConversionComplete,
		showError,
	]);

	const repeatConversion = useCallback(
		(entry: ConversionHistoryEntry) => {
			setFromCurrency(entry.fromCurrency);
			setToCurrency(entry.toCurrency);
			setAmount(entry.amount);
			if (storedApiKey) {
				void fetchRate();
			}
		},
		[storedApiKey, fetchRate],
	);

	return {
		amount,
		fromCurrency,
		toCurrency,
		rate,
		rateSource,
		handleFromCurrency,
		handleToCurrency,
		handleAmountChange,
		swapCurrencies,
		fetchRate,
		repeatConversion,
	};
}
