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
	mergeClasses,
	Tooltip,
} from "@fluentui/react-components";
import {
	DismissRegular,
	KeyRegular,
	ArrowClockwiseRegular,
	CheckmarkCircleRegular,
	ErrorCircleRegular,
	WarningRegular,
} from "@fluentui/react-icons";
import { useEffect, useState, useRef } from "react";

import { ActionButtons } from "./components/ActionButtons/ActionButtons";
import { CurrencyRow } from "./components/CurrencyRow/CurrencyRow";
import { ConversionHistory } from "./components/History/ConversionHistory";
import { ResultSection } from "./components/ResultSection/ResultSection";
import { ThemeSwitcher } from "./components/ThemeSwitcher/ThemeSwitcher";
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

// Define RateSource type
type RateSource = "idle" | "cache" | "api" | "error" | "loading";

// Define API Key Save Status type
type ApiKeySaveStatus =
	| "idle"
	| "validating"
	| "saving"
	| "saved"
	| "invalid"
	| "error";

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

const MESSAGE_TIMEOUT_DURATION = 5000; // 5 seconds

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
		alignItems: "center",
		marginBottom: tokens.spacingVerticalM,
		...shorthands.gap(tokens.spacingHorizontalS),
	},
	headerInputWrapper: {
		transitionProperty: "max-width, opacity",
		transitionDuration: "0.3s",
		transitionTimingFunction: "ease-out",
		overflow: "hidden",
		maxWidth: 0,
		opacity: 0,
	},
	headerInputWrapperVisible: {
		maxWidth: "250px",
		opacity: 1,
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
		flexBasis: "30%",
		...shorthands.gap(tokens.spacingVerticalL),
		[`@media (max-width: ${breakpoints.tablet}px)`]: {
			flexBasis: "100%",
			order: 1,
		},
	},
	rightColumn: {
		display: "flex",
		flexDirection: "column",
		flexBasis: "70%",
		...shorthands.gap(tokens.spacingVerticalL),
		[`@media (max-width: ${breakpoints.tablet}px)`]: {
			flexBasis: "100%",
			order: 2,
		},
	},
	historySection: {},
	controlsSection: {
		display: "flex",
		flexDirection: "column",
		...shorthands.gap(tokens.spacingVerticalL),
	},
	apiKeyStoredIcon: {
		color: tokens.colorStatusSuccessForeground1,
	},
	apiKeyMissingIcon: {
		color: tokens.colorStatusDangerForeground1,
	},
	messageBarContainer: {
		transitionProperty: "max-height, opacity",
		transitionDuration: "0.3s",
		transitionTimingFunction: "ease-in-out",
		overflow: "hidden",
		maxHeight: 0,
		opacity: 0,
	},
	messageBarContainerVisible: {
		maxHeight: "60px",
		opacity: 1,
		marginBottom: tokens.spacingVerticalM,
	},
	amountField: {
		"& input": {
			transitionProperty: "outline, box-shadow",
			transitionDuration: tokens.durationNormal,
			transitionTimingFunction: tokens.curveEasyEase,
			outlineStyle: "none",
		},
		":focus-within": {
			"& input": {
				outlineColor: tokens.colorCompoundBrandStroke,
				outlineStyle: "solid",
				outlineWidth: tokens.strokeWidthThick,
			},
		},
	},
	apiKeySavedIcon: {
		color: tokens.colorStatusSuccessForeground1,
	},
	apiKeyInvalidIcon: {
		color: tokens.colorStatusWarningForeground1,
	},
	apiKeyErrorIcon: {
		color: tokens.colorStatusDangerForeground1,
	},
	apiKeySavingIcon: {
		// Use default color or a specific one if desired
	},
});

interface AppProps {
	toggleTheme: () => void;
	isDarkMode: boolean;
}

function App({ toggleTheme, isDarkMode }: AppProps): JSX.Element {
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
	const [appMessage, setAppMessage] = useState<AppMessage>({
		text: null,
		intent: "info",
		visible: false,
	});
	const [isApiKeyHeaderInputVisible, setIsApiKeyHeaderInputVisible] =
		useState<boolean>(false);
	const [apiKeySaveStatus, setApiKeySaveStatus] =
		useState<ApiKeySaveStatus>("idle");

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
		setRate("--");
		setRateSource("idle");
		dismissMessage();
	};
	const handleToCurrency: (value: string) => void = (value: string) => {
		setToCurrency(value);
		setRate("--");
		setRateSource("idle");
		dismissMessage();
	};

	const handleAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number(event.target.value);
		if (!isNaN(value) && value >= 0) {
			setAmount(value);
		}
		setRate("--");
		setRateSource("idle");
		dismissMessage();
	};

	const fetchRate: () => Promise<void> = async () => {
		dismissMessage();
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
					showAppMessage(
						"Error fetching currency rate. Check your API key or network connection.",
						"error",
					);
				}
			}
		} catch (error) {
			console.error("Error calling getCurrencyRate service:", error);
			setRate("--");
			setRateSource("error");
			showAppMessage(
				"An unexpected error occurred while fetching the rate.",
				"error",
			);
		}
	}

	// Modified handleApiKeyChange for auto-save logic
	const handleApiKeyChange: (event: React.ChangeEvent<HTMLInputElement>) => void = (event: React.ChangeEvent<HTMLInputElement>) => {
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
					setRate("--");
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
		setRate("--");
		setRateSource("idle");
		setConversionHistory([]);
		saveConversionHistoryService([]);
		showAppMessage("All data cleared.", "warning");
	};

	const handleClearCacheAndFetch: () => void = () => {
		dismissMessage();
		clearRatesCache();
		setRate("--");
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
		setRate("--");
		setRateSource("idle");
	};

	const handleRepeatConversion: (entry: ConversionHistoryEntry) => void = (entry: ConversionHistoryEntry) => {
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

	// Function to render the status icon and tooltip
	const renderApiKeyStatusIcon: () => React.ReactNode = () => {
		const iconStyle = { fontSize: tokens.fontSizeBase400 }; // Increase icon size
		switch (apiKeySaveStatus) {
			case "saving":
				return (
					<Tooltip content="Saving API Key..." relationship="label">
						<ArrowClockwiseRegular
							className={styles.apiKeySavingIcon}
							style={iconStyle}
						/>
					</Tooltip>
				);
			case "saved":
				return (
					<Tooltip content="API Key Saved" relationship="label">
						<CheckmarkCircleRegular
							className={styles.apiKeySavedIcon}
							style={iconStyle}
						/>
					</Tooltip>
				);
			case "invalid":
				return (
					<Tooltip content="Invalid API Key Format" relationship="label">
						<WarningRegular
							className={styles.apiKeyInvalidIcon}
							style={iconStyle}
						/>
					</Tooltip>
				);
			case "error":
				return (
					<Tooltip content="Error Saving API Key" relationship="label">
						<ErrorCircleRegular
							className={styles.apiKeyErrorIcon}
							style={iconStyle}
						/>
					</Tooltip>
				);
			case "validating":
			case "idle":
			default:
				return null; // No icon for idle or validating states
		}
	};

	return (
		<div className={styles.appContainer}>
			<Card className={styles.root}>
				{/* Header Row */}
				<div className={styles.headerContainer}>
					<div
						className={mergeClasses(
							styles.headerInputWrapper,
							isApiKeyHeaderInputVisible && styles.headerInputWrapperVisible,
						)}
						style={{ display: "flex", alignItems: "center" }} // Align input and icon
					>
						{isApiKeyHeaderInputVisible && (
							<>
								<Input
									aria-label="API Key Header Input"
									type="password"
									placeholder="Enter API Key..."
									size="small"
									appearance="outline"
									style={{
										minWidth: "200px",
										marginRight: tokens.spacingHorizontalSNudge,
									}} // Add space before icon
									value={apiKeyInput}
									onChange={handleApiKeyChange}
									onBlur={handleApiKeyInputBlur}
								/>
								{/* Render the status icon */}
								{renderApiKeyStatusIcon()}
							</>
						)}
					</div>
					<Button
						appearance="subtle"
						icon={<KeyRegular />}
						className={
							storedApiKey ? styles.apiKeyStoredIcon : styles.apiKeyMissingIcon
						}
						onClick={toggleApiKeyHeaderInput}
						aria-label={
							isApiKeyHeaderInputVisible
								? "Hide API Key Input"
								: "Show API Key Input"
						}
					/>
					<ThemeSwitcher isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
				</div>

				{/* App Message Bar Container */}
				<div
					className={mergeClasses(
						styles.messageBarContainer,
						appMessage.visible && styles.messageBarContainerVisible,
					)}
				>
					{appMessage.visible && (
						<MessageBar intent={appMessage.intent} style={{ width: "100%" }}>
							<MessageBarBody>
								<MessageBarTitle></MessageBarTitle>
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
							<Field label="Amount" size="large" className={styles.amountField}>
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
							<ActionButtons
								storedApiKey={storedApiKey}
								amount={amount}
								rateSource={rateSource}
								isApiKeyValid={isApiKeyValid}
								apiKeyInput={apiKeyInput}
								isHistoryEmpty={conversionHistory.length === 0}
								onCalculate={fetchRate}
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
							<Text weight="semibold" as="h2" style={{ display: "block" }}>
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
