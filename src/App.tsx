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
	MessageBar,
	MessageBarBody,
	MessageBarTitle,
	Button,
	type MessageBarIntent,
} from "@fluentui/react-components";
import { DismissRegular } from '@fluentui/react-icons';
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

// Define RateSource type
type RateSource = "idle" | "cache" | "api" | "error" | "loading";

// App Message type
interface AppMessage {
	text: React.ReactNode | null; // Allow React nodes for links etc.
	intent: MessageBarIntent;
	visible: boolean;
}

// Define breakpoints (adjust values as needed)
const breakpoints = {
	small: 320,
	medium: 600,
	tablet: 768,
	large: 1024,
};

const useStyles = makeStyles({
	appContainer: {
		maxWidth: "1250px",
		margin: `${tokens.spacingVerticalXXL} auto`,
		paddingLeft: tokens.spacingHorizontalL,
		paddingRight: tokens.spacingHorizontalL,
		[`@media (max-width: ${breakpoints.medium}px)`]: {
			paddingLeft: tokens.spacingHorizontalM,
			paddingRight: tokens.spacingHorizontalM,
		},
	},
	root: {
		display: "flex",
		flexDirection: "column",
		...shorthands.gap(tokens.spacingVerticalXL),
		paddingTop: "40px",
		paddingBottom: tokens.spacingVerticalXXL,
		paddingLeft: tokens.spacingHorizontalXXL,
		paddingRight: tokens.spacingHorizontalXXL,
		backgroundColor: tokens.colorNeutralBackground2,
		[`@media (max-width: ${breakpoints.medium}px)`]: {
			paddingTop: tokens.spacingVerticalXXL,
			paddingBottom: tokens.spacingVerticalL,
		},
	},
	headerContainer: {
		display: "flex",
		justifyContent: "flex-end",
		marginBottom: tokens.spacingVerticalM, // Space between switcher and message bar
	},
	mainContent: {
		display: "flex",
		flexDirection: "row",
		...shorthands.gap(tokens.spacingHorizontalXXL),
		[`@media (max-width: ${breakpoints.tablet}px)`]: {
			flexDirection: "column",
			...shorthands.gap(tokens.spacingVerticalXL),
		},
	},
	leftColumn: {
		display: "flex",
		flexDirection: "column",
		flexBasis: "60%",
		...shorthands.gap(tokens.spacingVerticalL),
		[`@media (max-width: ${breakpoints.tablet}px)`]: {
			flexBasis: "100%",
			order: 1,
		},
	},
	rightColumn: {
		display: "flex",
		flexDirection: "column",
		flexBasis: "40%",
		...shorthands.gap(tokens.spacingVerticalL),
		[`@media (max-width: ${breakpoints.tablet}px)`]: {
			flexBasis: "100%",
			order: 2,
		},
	},
	historySection: {
	},
	controlsSection: {
		display: "flex",
		flexDirection: "column",
		...shorthands.gap(tokens.spacingVerticalL),
	},
	messageBarContainer: {
		minHeight: "52px",
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
	const [rate, setRate] = useState<number | "--">("--");
	const [rateSource, setRateSource] = useState<RateSource>("idle");
	const [conversionHistory, setConversionHistory] = useState<
		ConversionHistoryEntry[]
	>([]);
	const [appMessage, setAppMessage] = useState<AppMessage>({ text: null, intent: 'info', visible: false });

	// Function to dismiss message
	const dismissMessage = () => {
		setAppMessage((prev) => ({ ...prev, visible: false }));
	};

	const handleFromCurrency = (value: string) => {
		setFromCurrency(value);
		setRate("--");
		setRateSource("idle");
		dismissMessage(); // Clear message on input change
	};
	const handleToCurrency = (value: string) => {
		setToCurrency(value);
		setRate("--");
		setRateSource("idle");
		dismissMessage(); // Clear message on input change
	};

	const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number(event.target.value);
		if (!isNaN(value) && value >= 0) {
			setAmount(value);
		}
		setRate("--");
		setRateSource("idle");
		dismissMessage(); // Clear message on input change
	};

	async function fetchRate(): Promise<void> {
		dismissMessage(); // Clear previous messages
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
					// Show error message
					setAppMessage({
						text: "Error fetching currency rate. Check your API key or network connection.",
						intent: 'error',
						visible: true
					});
				}
			}
		} catch (error) {
			console.error("Error calling getCurrencyRate service:", error);
			setRate("--");
			setRateSource("error");
			setAppMessage({
				text: "An unexpected error occurred while fetching the rate.",
				intent: 'error',
				visible: true
			});
		}
	}

	const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		dismissMessage(); // Clear message on input change
		const newKey = event.target.value.trim();
		setApiKeyInput(newKey);
		if (newKey === "") {
			setIsApiKeyValid(true);
		} else {
			const isValid = apiKeyRegex.test(newKey);
			setIsApiKeyValid(isValid);
			if (!isValid) {
				setAppMessage({ text: "Invalid API Key format.", intent: 'warning', visible: true });
			}
		}
	};

	async function saveApiKey(): Promise<void> {
		dismissMessage(); // Clear previous messages
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
			setAppMessage({ text: "API Key saved successfully.", intent: 'success', visible: true });
		} catch (error) {
			console.error("Failed to save API key:", error);
			const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while saving the API key.";
			setAppMessage({ text: `Failed to save API key: ${errorMessage}`, intent: 'error', visible: true });
			setStoredApiKey(null);
		}
	}

	const clearApiAndCache = () => {
		dismissMessage();
		clearLocalStorage();
		setApiKeyInput("");
		setStoredApiKey(null);
		setIsApiKeyValid(true);
		setRate("--");
		setRateSource("idle");
		setConversionHistory([]);
		saveConversionHistoryService([]);
		setAppMessage({ text: "All data cleared.", intent: 'warning', visible: true });
	};

	const handleClearCacheAndFetch = () => {
		dismissMessage();
		clearRatesCache();
		setRate("--");
		setRateSource("idle");
		setAppMessage({ text: "Rates cache cleared.", intent: 'info', visible: true });
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
				setAppMessage({
					text: "Invalid API key found in storage. Please enter a valid key.",
					intent: 'warning',
					visible: true
				});
				clearRatesCache();
			}
		}
		const loadedHistory = loadConversionHistoryService();
		setConversionHistory(loadedHistory);
	}, []);

	const swapCurrencies = () => {
		dismissMessage();
		const temp = fromCurrency;
		setFromCurrency(toCurrency);
		setToCurrency(temp);
		setRate("--");
		setRateSource("idle");
	};

	const handleRepeatConversion = (entry: ConversionHistoryEntry) => {
		dismissMessage();
		setFromCurrency(entry.fromCurrency);
		setToCurrency(entry.toCurrency);
		setAmount(entry.amount);
		if (storedApiKey) {
			void fetchRate();
		}
	};

	const clearConversionHistory = () => {
		dismissMessage();
		setConversionHistory([]);
		saveConversionHistoryService([]);
		setAppMessage({ text: "Conversion history cleared.", intent: 'info', visible: true });
	};

	return (
		<div className={styles.appContainer}>
			<Card className={styles.root}>

				{/* Header Row for Theme Switcher */}
				<div className={styles.headerContainer}>
					<ThemeSwitcher isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
				</div>

				{/* App Message Bar Container (for CLS prevention) */}
				<div className={styles.messageBarContainer}>
					{appMessage.visible && (
						<MessageBar
							intent={appMessage.intent}
							style={{ width: '100%' }} // Allow bar to take full width of container
						>
							<MessageBarBody>
								<MessageBarTitle>
								</MessageBarTitle>
								{appMessage.text}
							</MessageBarBody>
							<Button
								appearance="transparent"
								icon={<DismissRegular />}
								onClick={dismissMessage}
								aria-label="Dismiss message"
							/>
						</MessageBar>
					)}
				</div>

				<div className={styles.mainContent}>
					{/* Left Column: Inputs and Controls */}
					<div className={styles.leftColumn}>
						{/* Conversion Block */}
						<div className={styles.controlsSection}>
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
							<ResultSection
								rate={rate}
								rateSource={rateSource}
								amount={amount}
								fromCurrency={fromCurrency}
								toCurrency={toCurrency}
							/>
						</div>

						<Divider />

						<div className={styles.controlsSection}>
							<ApiKeySection
								apiKeyInput={apiKeyInput}
								storedApiKey={storedApiKey}
								isApiKeyValid={isApiKeyValid}
								onApiKeyChange={handleApiKeyChange}
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
						</div>
					</div>

					{/* Right Column: History */}
					<div className={styles.rightColumn}>
						{/* History Section Content */}
						<div className={styles.historySection}>
							<Text weight="semibold" as="h2" style={{ display: 'block' }}>
								Conversion History (Last 10)
							</Text>
							<Divider />
							<ConversionHistory
								history={conversionHistory}
								onRepeat={handleRepeatConversion}
							/>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}

export default App;
