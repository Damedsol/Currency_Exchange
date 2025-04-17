import type React from "react";
import { useEffect, useState } from "react";
import {
	makeStyles,
	shorthands,
	tokens,
	Divider,
	Text,
	Field,
	Input,
	Card,
} from "@fluentui/react-components";
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
import { ThemeSwitcher } from "./components/ThemeSwitcher/ThemeSwitcher";
import { CurrencyRow } from "./components/CurrencyRow/CurrencyRow";
import { ApiKeySection } from "./components/ApiKeySection/ApiKeySection";
import { ResultSection } from "./components/ResultSection/ResultSection";
import { ActionButtons } from "./components/ActionButtons/ActionButtons";

type RateSource = "idle" | "cache" | "api" | "error" | "loading";

const useStyles = makeStyles({
	appContainer: {
		maxWidth: "600px",
		margin: `${tokens.spacingVerticalXXL} auto`,
		paddingLeft: tokens.spacingHorizontalL,
		paddingRight: tokens.spacingHorizontalL,
	},
	root: {
		display: "flex",
		flexDirection: "column",
		...shorthands.gap(tokens.spacingVerticalXL),
		...shorthands.padding(tokens.spacingVerticalXXL, tokens.spacingHorizontalXXL),
		backgroundColor: tokens.colorNeutralBackground2,
	},
	historySection: {
	},
});

interface AppProps {
	toggleTheme: () => void;
	isDarkMode: boolean;
}

function App({ toggleTheme, isDarkMode }: AppProps) {
	const styles = useStyles();
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

	const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number(event.target.value);
		if (!isNaN(value) && value >= 0) {
			setAmount(value);
		}
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

	const clearConversionHistory = () => {
		setConversionHistory([]);
		saveConversionHistoryService([]);
	};

	return (
		<div className={styles.appContainer}>
			<Card className={styles.root}>
				<ThemeSwitcher isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
				<CurrencyRow
					fromCurrency={fromCurrency}
					toCurrency={toCurrency}
					onFromChange={handleFromCurrency}
					onToChange={handleToCurrency}
					onSwap={swapCurrencies}
				/>
				<Field
					label="Amount"
					size="large"
				>
					<Input
						type="number"
						value={amount.toString()}
						onChange={handleAmountChange}
						appearance="outline"
						size="large"
					/>
				</Field>
				<ApiKeySection
					apiKeyInput={apiKeyInput}
					storedApiKey={storedApiKey}
					isApiKeyValid={isApiKeyValid}
					saveError={saveError}
					onApiKeyChange={handleApiKeyChange}
				/>
				<ResultSection
					rate={rate}
					rateSource={rateSource}
					amount={amount}
					fromCurrency={fromCurrency}
					toCurrency={toCurrency}
				/>
				<ActionButtons
					storedApiKey={storedApiKey}
					amount={amount}
					rateSource={rateSource}
					isApiKeyValid={isApiKeyValid}
					apiKeyInput={apiKeyInput}
					isHistoryEmpty={conversionHistory.length === 0}
					onCalculate={fetchRate}
					onSaveKey={saveApiKey}
					onRefreshRates={handleClearCacheAndFetch}
					onClearHistory={clearConversionHistory}
					onClearAll={clearApiAndCache}
				/>
				<div className={styles.historySection}>
					<Divider />
					<Text weight="semibold" as="h2" style={{ marginTop: tokens.spacingVerticalL, display: 'block' }}>
						Conversion History (Last 10 conversions)
					</Text>
					<ConversionHistory
						history={conversionHistory}
						onRepeat={handleRepeatConversion}
					/>
				</div>
			</Card>
		</div>
	);
}

export default App;
