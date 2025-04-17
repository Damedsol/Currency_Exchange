import {
	DeleteFilled,
	MoneyCalculatorFilled,
	SaveFilled,
	ArrowClockwiseFilled,
	ArrowSyncRegular,
} from "@fluentui/react-icons";
import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "@fluentui/react-components";
import { ButtonDanger } from "./components/Buttons/danger/ButtonDanger.tsx";
import { ButtonPrimary } from "./components/Buttons/primary/ButtonPrimary.tsx";
import { CurrencySelector } from "./components/CurrencySelector/CurrencySelector.tsx";
import { Field } from "./components/Field/Field.tsx";
import { Label } from "./components/Label/Label.tsx";
import {
	getCurrencyRate,
	type CurrencyRateResult,
} from "./services/FreeCurrency";
import {
	clearLocalStorage,
	localStorageFetchService,
	localStorageStoreService,
	apiKeyRegex,
	loadConversionHistoryService,
	saveConversionHistoryService,
	clearRatesCache,
	type ConversionHistoryEntry,
} from "./services/LocalStorage.ts";
import { ConversionHistory } from "./components/History/ConversionHistory";

type RateSource = "idle" | "cache" | "api" | "error" | "loading";

function App() {
	const [fromCurrency, setFromCurrency] = useState<string>("EUR");
	const [toCurrency, setToCurrency] = useState<string>("USD");
	const [amount, setAmount] = useState<number>(1);
	const [apiKeyInput, setApiKeyInput] = useState<string>("");
	const [storedApiKey, setStoredApiKey] = useState<string | null>(null);
	const [isApiKeyValid, setIsApiKeyValid] = useState<boolean>(true);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [rate, setRate] = useState<number | "--">("--");
	const [rateSource, setRateSource] = useState<RateSource>("idle");
	const [conversionHistory, setConversionHistory] = useState<
		ConversionHistoryEntry[]
	>([]);

	const handleFromCurrency = (value: string) => {
		setFromCurrency(value);
		setRate("--");
		setRateSource("idle");
	};
	const handleToCurrency = (value: string) => {
		setToCurrency(value);
		setRate("--");
		setRateSource("idle");
	};

	async function fetchRate(): Promise<void> {
		if (!storedApiKey || amount <= 0 || fromCurrency === toCurrency) {
			setRate(fromCurrency === toCurrency ? 1.0 : "--");
			setRateSource(fromCurrency === toCurrency ? "api" : "idle");
			return;
		}

		setRateSource("loading");
		setRate("--");

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

				const newEntry: ConversionHistoryEntry = {
					fromCurrency,
					toCurrency,
					amount,
					rate: currentRate,
					result: conversionResult,
					timestamp: Date.now(),
				};

				setConversionHistory((prevHistory) => {
					const updatedHistory = [newEntry, ...prevHistory].slice(0, 10);
					saveConversionHistoryService(updatedHistory);
					return updatedHistory;
				});
			} else {
				console.error(
					`Failed to get rate (${result.source}), rate: ${result.rate}`,
				);
				setRate("--");
				if (result.source === "error") {
					// Optionally show a user-facing error message here
				}
			}
		} catch (error) {
			console.error("Error calling getCurrencyRate service:", error);
			setRate("--");
			setRateSource("error");
		}
	}

	const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newKey = event.target.value.trim();
		setApiKeyInput(newKey);
		setSaveError(null);
		if (newKey === "") {
			setIsApiKeyValid(true);
		} else {
			const isValid = apiKeyRegex.test(newKey);
			setIsApiKeyValid(isValid);
		}
	};

	async function saveApiKey(): Promise<void> {
		setSaveError(null);
		const keyToSave = apiKeyInput.trim();
		if (!isApiKeyValid || keyToSave === "") return;

		try {
			await localStorageStoreService(keyToSave);
			setStoredApiKey(keyToSave);
			setApiKeyInput(keyToSave);
			setIsApiKeyValid(true);
			clearRatesCache();
			setRate("--");
			setRateSource("idle");
		} catch (error) {
			console.error("Failed to save API key:", error);
			if (error instanceof Error) {
				setSaveError(error.message);
			} else {
				setSaveError("An unknown error occurred while saving the API key.");
			}
			setStoredApiKey(null);
		}
	}

	const clearApiAndCache = () => {
		clearLocalStorage();
		setApiKeyInput("");
		setStoredApiKey(null);
		setIsApiKeyValid(true);
		setSaveError(null);
		setRate("--");
		setRateSource("idle");
		setConversionHistory([]);
		saveConversionHistoryService([]);
	};

	const handleClearCacheAndFetch = () => {
		clearRatesCache();
		setRate("--");
		setRateSource("idle");
		if (storedApiKey && amount > 0 && fromCurrency !== toCurrency) {
			void fetchRate();
		}
	};

	useEffect(() => {
		const fetchedApiKey = localStorageFetchService();
		if (fetchedApiKey) {
			if (apiKeyRegex.test(fetchedApiKey)) {
				setStoredApiKey(fetchedApiKey);
				setApiKeyInput(fetchedApiKey);
				setIsApiKeyValid(true);
			} else {
				console.warn("Invalid API key found in storage.");
				setStoredApiKey(null);
				setApiKeyInput("");
				setIsApiKeyValid(false);
				setSaveError(
					"Invalid API key loaded from storage. Please enter a valid key.",
				);
				clearRatesCache();
			}
		}
		const loadedHistory = loadConversionHistoryService();
		setConversionHistory(loadedHistory);
	}, []);

	const swapCurrencies = () => {
		const temp = fromCurrency;
		setFromCurrency(toCurrency);
		setToCurrency(temp);
		setRate("--");
		setRateSource("idle");
	};

	const handleRepeatConversion = (entry: ConversionHistoryEntry) => {
		setFromCurrency(entry.fromCurrency);
		setToCurrency(entry.toCurrency);
		setAmount(entry.amount);
		if (storedApiKey) {
			void fetchRate();
		}
	};

	const renderRateSourceIndicator = () => {
		if (rateSource === "loading") {
			return <span style={{ marginLeft: "8px", fontSize: "small" }}>Loading...</span>;
		}
		if (rateSource === "cache") {
			return (
				<span
					title="Data from cache (max 24h old)"
					style={{ marginLeft: "8px", fontSize: "small", cursor: "help" }}
				>
					<ArrowSyncRegular style={{ verticalAlign: "middle" }} /> (cached)
				</span>
			);
		}
		if (rateSource === "api") {
			return (
				<span
					title="Live data from API"
					style={{ marginLeft: "8px", fontSize: "small", cursor: "help" }}
				>
					<ArrowSyncRegular style={{ verticalAlign: "middle" }} /> (live)
				</span>
			);
		}
		if (rateSource === "error") {
			return (
				<span style={{ marginLeft: "8px", fontSize: "small", color: "red" }}>
					Error fetching rate
				</span>
			);
		}
		return null;
	};

	return (
		<>
			<CurrencySelector
				value={fromCurrency}
				onChange={handleFromCurrency}
				where={"from"}
			/>

			<ButtonPrimary onClick={swapCurrencies}>
				<ArrowClockwiseFilled style={{ fontSize: "24px" }} />
			</ButtonPrimary>

			<CurrencySelector
				value={toCurrency}
				onChange={handleToCurrency}
				where={"to"}
			/>
			<Field
				label={"Amount"}
				value={amount.toString()}
				type={"number"}
				onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
					const value = Number(event.target.value);
					if (!isNaN(value) && value >= 0) {
						setAmount(value);
					}
					setRate("--");
					setRateSource("idle");
				}}
			/>
			<Field
				label={"Api Key"}
				validationState={
					saveError || (!isApiKeyValid && apiKeyInput !== "")
						? "error"
						: storedApiKey && apiKeyInput === storedApiKey
							? "success"
							: isApiKeyValid && apiKeyInput !== ""
								? "warning"
								: "none"
				}
				validationMessage={
					saveError
						? saveError
						: !isApiKeyValid && apiKeyInput !== ""
							? "Invalid format. Must start with fca_live_ + 40 alphanumeric chars."
							: storedApiKey && apiKeyInput === storedApiKey
								? "API Key is valid and stored."
								: isApiKeyValid && apiKeyInput !== ""
									? "Valid format. Press Save to store this key."
									: apiKeyInput === "" && !storedApiKey
										? "API Key is required."
										: ""
				}
				required
				value={apiKeyInput}
				onChange={handleApiKeyChange}
			/>
			<p
				style={{ fontSize: "small", marginTop: "-10px", marginBottom: "10px" }}
			>
				Get your free API key from{" "}
				<Link
					href="https://freecurrencyapi.com/"
					target="_blank"
					rel="noopener noreferrer"
				>
					freecurrencyapi.com
				</Link>
			</p>
			<div>
				<Label
					text={`Rate: ${typeof rate === "number" ? rate.toFixed(4) : "--"}`}
					size={"large"}
				/>
				{renderRateSourceIndicator()}
			</div>
			{typeof rate === "number" && (
				<Label
					text={`${amount} ${fromCurrency} = ${(amount * rate).toFixed(2)} ${toCurrency}`}
					size={"large"}
				/>
			)}

			<div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
				<ButtonPrimary
					onClick={fetchRate}
					disabled={!storedApiKey || amount <= 0 || rateSource === "loading"}
				>
					<span>{rateSource === "loading" ? "Calculating..." : "Calculate"}</span>
					<MoneyCalculatorFilled style={{ fontSize: "24px" }} />
				</ButtonPrimary>

				<ButtonPrimary
					onClick={saveApiKey}
					disabled={
						!isApiKeyValid ||
						apiKeyInput === "" ||
						apiKeyInput === storedApiKey
					}
				>
					<span>Save Key</span>
					<SaveFilled style={{ fontSize: "24px" }} />
				</ButtonPrimary>

		
				<ButtonPrimary
					onClick={handleClearCacheAndFetch}
					disabled={rateSource === "loading"}
					title="Clear cached rates and fetch live data"
				>
					<span>Refresh Rates</span>	
					<ArrowSyncRegular style={{ fontSize: "24px" }} />
				</ButtonPrimary>

					<hr/>

				<ButtonDanger onClick={clearApiAndCache}>
					<span>Clear all data</span>
					<DeleteFilled style={{ fontSize: "24px" }} />
				</ButtonDanger>

			</div>

			<ConversionHistory
				history={conversionHistory}
				onRepeat={handleRepeatConversion}
			/>
		</>
	);
}

export default App;
