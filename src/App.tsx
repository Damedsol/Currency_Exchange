import {
	makeStyles,
	shorthands,
	tokens,
	Card,
	type MessageBarIntent,
} from "@fluentui/react-components";
import {} from // Icons are now primarily used within sub-components
"@fluentui/react-icons";
import { useEffect, useState, useRef } from "react";

// Import new layout components
import { AppHeader } from "./components/AppHeader/AppHeader";
import { AppMessageBar } from "./components/AppMessageBar/AppMessageBar";
import { ConversionControls } from "./components/ConversionControls/ConversionControls";
import { HistoryPanel } from "./components/HistoryPanel/HistoryPanel";
// Keep service imports
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

import type React from "react";

// Keep type definitions
type RateSource = "idle" | "cache" | "api" | "error" | "loading";
type ApiKeySaveStatus =
	| "idle"
	| "validating"
	| "saving"
	| "saved"
	| "invalid"
	| "error";
interface AppMessage {
	text: React.ReactNode | null;
	intent: MessageBarIntent;
	visible: boolean;
}

// Keep breakpoints and constants
const breakpoints = {
	small: 320,
	medium: 600,
	tablet: 768,
	large: 1024,
};
const MESSAGE_TIMEOUT_DURATION = 5000;

// Simplify useStyles for App.tsx - keep only top-level layout styles
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
		...shorthands.gap(tokens.spacingVerticalL),
		paddingTop: "20px",
		paddingBottom: tokens.spacingVerticalXXL,
		paddingLeft: tokens.spacingHorizontalXL,
		paddingRight: tokens.spacingHorizontalXL,
		backgroundColor: tokens.colorNeutralBackground2,
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
});

interface AppProps {
	toggleTheme: () => void;
	isDarkMode: boolean;
}

function App({ toggleTheme, isDarkMode }: AppProps): JSX.Element {
	const styles = useStyles();
	const [amount, setAmount] = useState(1000);
	const [fromCurrency, setFromCurrency] = useState("EUR");
	const [toCurrency, setToCurrency] = useState("USD");
	const [apiKeyInput, setApiKeyInput] = useState<string>("");
	const [storedApiKey, setStoredApiKey] = useState<string | null>(null);
	const [isApiKeyValid, setIsApiKeyValid] = useState<boolean>(true);
	const [rate, setRate] = useState<number>(0);
	const [rateSource, setRateSource] = useState<RateSource>("idle");
	const [conversionHistory, setConversionHistory] = useState<
		ConversionHistoryEntry[]
	>([]);
	const [appMessage, setAppMessage] = useState<AppMessage>({
		text: null,
		intent: "info",
		visible: false,
	});
	const [isApiKeyHeaderInputVisible, setIsApiKeyHeaderInputVisible] =
		useState<boolean>(false);
	const [apiKeySaveStatus, setApiKeySaveStatus] =
		useState<ApiKeySaveStatus>("idle");
	const [isHistoryClearDialogOpen, setIsHistoryClearDialogOpen] =
		useState<boolean>(false);

	// Ref to store message timeout ID
	const messageTimeoutRef = useRef<number | null>(null);
	// Ref to store blur timeout ID
	const blurTimeoutRef = useRef<number | null>(null);
	// Ref to store API Key save debounce timeout ID
	const saveTimeoutRef = useRef<number | null>(null);

	// Helper function to clear the message timeout
	const clearMessageTimeout: () => void = () => {
		if (messageTimeoutRef.current) {
			clearTimeout(messageTimeoutRef.current);
			messageTimeoutRef.current = null;
		}
	};

	// Helper function to clear the blur timeout
	const clearBlurTimeout: () => void = () => {
		if (blurTimeoutRef.current) {
			clearTimeout(blurTimeoutRef.current);
			blurTimeoutRef.current = null;
		}
	};

	// Helper function to clear the save timeout
	const clearSaveTimeout: () => void = () => {
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
			saveTimeoutRef.current = null;
		}
	};

	// Updated dismissMessage to clear message timeout
	const dismissMessage: () => void = () => {
		clearMessageTimeout();
		setAppMessage((prev) => ({ ...prev, visible: false }));
	};

	// Helper function to show messages and set timeout
	const showAppMessage: (
		text: React.ReactNode,
		intent: MessageBarIntent,
		duration?: number,
	) => void = (
		text: React.ReactNode,
		intent: MessageBarIntent,
		duration: number = MESSAGE_TIMEOUT_DURATION,
	) => {
		clearMessageTimeout();
		setAppMessage({ text, intent, visible: true });
		messageTimeoutRef.current = setTimeout(() => {
			dismissMessage();
		}, duration);
	};

	// Cleanup timeouts on component unmount
	useEffect(() => {
		return () => {
			clearMessageTimeout();
			clearBlurTimeout();
			clearSaveTimeout(); // Clear save timeout on unmount
		};
	}, []);

	// Toggle header input visibility
	const toggleApiKeyHeaderInput: () => void = () => {
		const willBeVisible = !isApiKeyHeaderInputVisible;
		setIsApiKeyHeaderInputVisible(willBeVisible);
		dismissMessage();
		clearBlurTimeout();
	};

	// Handle blur for the header API key input
	const handleApiKeyInputBlur: () => void = () => {
		clearBlurTimeout();
		blurTimeoutRef.current = setTimeout(() => {
			setIsApiKeyHeaderInputVisible(false);
		}, 150);
	};

	const handleFromCurrency: (value: string) => void = (value: string) => {
		setFromCurrency(value);
		setRate(0);
		setRateSource("idle");
		dismissMessage();
	};
	const handleToCurrency: (value: string) => void = (value: string) => {
		setToCurrency(value);
		setRate(0);
		setRateSource("idle");
		dismissMessage();
	};

	const handleAmountChange: (
		event: React.ChangeEvent<HTMLInputElement>,
	) => void = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number(event.target.value);
		if (!isNaN(value) && value >= 0) {
			setAmount(value);
		}
		setRate(0);
		setRateSource("idle");
		dismissMessage();
	};

	const fetchRate: () => Promise<void> = async () => {
		dismissMessage();
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
				setRate(0);
				if (result.source === "error") {
					showAppMessage(
						"Error fetching currency rate. Check your API key or network connection.",
						"error",
					);
				}
			}
		} catch (error) {
			console.error("Error calling getCurrencyRate service:", error);
			setRate(0);
			setRateSource("error");
			showAppMessage(
				"An unexpected error occurred while fetching the rate.",
				"error",
			);
		}
	};

	// Modified handleApiKeyChange for auto-save logic
	const handleApiKeyChange: (
		event: React.ChangeEvent<HTMLInputElement>,
	) => void = (event: React.ChangeEvent<HTMLInputElement>) => {
		clearSaveTimeout(); // Clear any pending save
		dismissMessage(); // Dismiss previous messages
		const newKey = event.target.value; // Don't trim here, let validation handle spaces if needed
		setApiKeyInput(newKey);
		setIsApiKeyValid(true); // Assume valid initially until debounce checks

		if (newKey === "") {
			setApiKeySaveStatus("idle");
		} else {
			setApiKeySaveStatus("validating"); // Set status to validating while typing
		}
	};

	// useEffect for debounced API Key saving
	useEffect(() => {
		// Don't save if the input is empty or just validating
		if (apiKeyInput === "" || apiKeySaveStatus === "idle") {
			setApiKeySaveStatus("idle"); // Ensure status is idle if input is empty
			return;
		}

		if (apiKeySaveStatus === "validating") {
			clearSaveTimeout(); // Clear previous timeout if user is still typing

			saveTimeoutRef.current = setTimeout(async () => {
				const keyToValidate = apiKeyInput.trim(); // Trim now before validation/saving
				if (keyToValidate === "") {
					// Check if empty after trim
					setApiKeySaveStatus("idle");
					return;
				}

				const isValidFormat = apiKeyRegex.test(keyToValidate);
				setIsApiKeyValid(isValidFormat); // Update validity state

				if (!isValidFormat) {
					setApiKeySaveStatus("invalid");
					return;
				}

				// If format is valid, proceed to save
				setApiKeySaveStatus("saving");
				try {
					await localStorageStoreService(keyToValidate);
					setStoredApiKey(keyToValidate); // Update stored key state
					setApiKeySaveStatus("saved");
					clearRatesCache(); // Clear cache on new key save
					setRate(0);
					setRateSource("idle");
				} catch (error) {
					console.error("Failed to save API key automatically:", error);
					setApiKeySaveStatus("error");
					setStoredApiKey(null); // Clear stored key on save error
				}
			}, 1000); // Debounce time: 1 second
		}

		// Cleanup function for the effect
		return () => {
			clearSaveTimeout();
		};
	}, [apiKeyInput, apiKeySaveStatus]); // Rerun effect when input changes or status becomes validating

	const clearApiAndCache: () => void = () => {
		dismissMessage();
		clearLocalStorage();
		setApiKeyInput("");
		setStoredApiKey(null);
		setIsApiKeyValid(true);
		setRate(0);
		setRateSource("idle");
		setConversionHistory([]);
		saveConversionHistoryService([]);
		showAppMessage("All data cleared.", "warning");
	};

	const handleClearCacheAndFetch: () => void = () => {
		dismissMessage();
		clearRatesCache();
		setRate(0);
		setRateSource("idle");
		showAppMessage("Rates cache cleared.", "info");
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
				showAppMessage(
					"Invalid API key found in storage. Please enter a valid key.",
					"warning",
				);
				clearRatesCache();
			}
		}
		const loadedHistory = loadConversionHistoryService();
		setConversionHistory(loadedHistory);
	}, []);

	const swapCurrencies: () => void = () => {
		dismissMessage();
		const temp = fromCurrency;
		setFromCurrency(toCurrency);
		setToCurrency(temp);
		setRate(0);
		setRateSource("idle");
	};

	const handleRepeatConversion: (entry: ConversionHistoryEntry) => void = (
		entry: ConversionHistoryEntry,
	) => {
		dismissMessage();
		setFromCurrency(entry.fromCurrency);
		setToCurrency(entry.toCurrency);
		setAmount(entry.amount);
		if (storedApiKey) {
			void fetchRate();
		}
	};

	const clearConversionHistory: () => void = () => {
		dismissMessage();
		setConversionHistory([]);
		saveConversionHistoryService([]);
		showAppMessage("Conversion history cleared.", "info");
	};

	return (
		<div className={styles.appContainer}>
			<Card className={styles.root}>
				<AppHeader
					isDarkMode={isDarkMode}
					toggleTheme={toggleTheme}
					storedApiKey={storedApiKey}
					isApiKeyHeaderInputVisible={isApiKeyHeaderInputVisible}
					apiKeyInput={apiKeyInput}
					apiKeySaveStatus={apiKeySaveStatus}
					handleApiKeyChange={handleApiKeyChange}
					handleApiKeyInputBlur={handleApiKeyInputBlur}
					toggleApiKeyHeaderInput={toggleApiKeyHeaderInput}
				/>

				<AppMessageBar
					appMessage={appMessage}
					dismissMessage={dismissMessage}
				/>

				<main className={styles.mainContent}>
					<ConversionControls
						fromCurrency={fromCurrency}
						toCurrency={toCurrency}
						amount={amount}
						rate={rate}
						rateSource={rateSource}
						storedApiKey={storedApiKey}
						isApiKeyValid={isApiKeyValid}
						apiKeyInput={apiKeyInput}
						conversionHistory={conversionHistory}
						handleFromCurrency={handleFromCurrency}
						handleToCurrency={handleToCurrency}
						swapCurrencies={swapCurrencies}
						handleAmountChange={handleAmountChange}
						handleClearCacheAndFetch={handleClearCacheAndFetch}
						fetchRate={fetchRate}
						clearConversionHistory={clearConversionHistory}
						clearApiAndCache={clearApiAndCache}
					/>
					<HistoryPanel
						history={conversionHistory}
						onRepeatConversion={handleRepeatConversion}
						clearConversionHistory={clearConversionHistory}
					/>
				</main>
			</Card>
		</div>
	);
}

export default App;
