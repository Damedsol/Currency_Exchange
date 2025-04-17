import {
	DeleteFilled,
	MoneyCalculatorFilled,
	SaveFilled,
	ArrowClockwiseFilled,
} from "@fluentui/react-icons";
import type React from "react";
import { useEffect, useState } from "react";
import { ButtonDanger } from "./components/Buttons/danger/ButtonDanger.tsx";
import { ButtonPrimary } from "./components/Buttons/primary/ButtonPrimary.tsx";
import { CurrencySelector } from "./components/CurrencySelector/CurrencySelector.tsx";
import { Field } from "./components/Field/Field.tsx";
import { Label } from "./components/Label/Label.tsx";
import { FreeCurrency } from "./services/FreeCurrency";
import {
	clearLocalStorage,
	localStorageFetchService,
	localStorageStoreService,
	apiKeyRegex,
	loadConversionHistoryService,
	saveConversionHistoryService,
	type ConversionHistoryEntry,
} from "./services/LocalStorage.ts";
import { Link } from "@fluentui/react-components";
import { ConversionHistory } from "./components/History/ConversionHistory";

function App() {
	const [fromCurrency, setFromCurrency] = useState<string>("EUR");
	const [toCurrency, setToCurrency] = useState<string>("USD");
	const [amount, setAmount] = useState<number>(1);
	const [apiKeyInput, setApiKeyInput] = useState<string>(""); // Input field value
	const [storedApiKey, setStoredApiKey] = useState<string | null>(null); // Confirmed stored key
	const [isApiKeyValid, setIsApiKeyValid] = useState<boolean>(true); // Validity of the input
	const [saveError, setSaveError] = useState<string | null>(null); // Error during save
	const [rate, setRate] = useState<number | "--">("--"); // Assuming rate is number
	const [conversionHistory, setConversionHistory] = useState<
		ConversionHistoryEntry[]
	>([]); // History state

	const handleFromCurrency = (value: string) => setFromCurrency(value);
	const handleToCurrency = (value: string) => setToCurrency(value);

	async function fetchRate(): Promise<void> {
		if (!storedApiKey || amount <= 0) return; // Basic validation

		try {
			// FreeCurrency returns the rate directly (number) or null
			const currentRate = await FreeCurrency({
				fromCurrency,
				toCurrency,
				apiKey: storedApiKey,
			});

			if (typeof currentRate === "number") {
				const result = amount * currentRate;
				setRate(currentRate); // Update rate state

				// Create and save history entry
				const newEntry: ConversionHistoryEntry = {
					fromCurrency,
					toCurrency,
					amount,
					rate: currentRate,
					result,
					timestamp: Date.now(),
				};

				setConversionHistory((prevHistory) => {
					// Add new entry and limit to max length
					const updatedHistory = [newEntry, ...prevHistory].slice(0, 10);
					saveConversionHistoryService(updatedHistory); // Persist to localStorage
					return updatedHistory;
				});
			} else {
				console.error("Invalid rate data received:", currentRate);
				setRate("--"); // Reset rate display on error
			}
		} catch (error) {
			console.error("Error fetching currency rate:", error);
			setRate("--"); // Reset rate display on error
		}
	}

	// Function to handle API key input changes
	const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newKey = event.target.value.trim(); // Trim whitespace immediately
		setApiKeyInput(newKey);
		setSaveError(null); // Clear previous save errors on input change
		if (newKey === "") {
			setIsApiKeyValid(true); // Consider empty as 'not invalid'
		} else {
			const isValid = apiKeyRegex.test(newKey);
			setIsApiKeyValid(isValid);
		}
	};

	// Function to save the API key
	async function saveApiKey(): Promise<void> {
		setSaveError(null);
		const keyToSave = apiKeyInput.trim(); // Ensure we save the trimmed version
		try {
			await localStorageStoreService(keyToSave); // Try to save the trimmed input
			setStoredApiKey(keyToSave); // If save is successful, update the stored key state with trimmed version
			setApiKeyInput(keyToSave); // Also update input field state in case trim removed spaces
			setIsApiKeyValid(true); // Mark as valid after successful save
			// Optional: show a success message or clear the input
		} catch (error) {
			console.error("Failed to save API key:", error);
			if (error instanceof Error) {
				setSaveError(error.message);
			} else {
				setSaveError("An unknown error occurred while saving the API key.");
			}
			setStoredApiKey(null); // Ensure stored key state reflects the failure
		}
	}

	const clearApiKey = () => {
		clearLocalStorage();
		setApiKeyInput(""); // Clear input field
		setStoredApiKey(null); // Clear stored key state
		setIsApiKeyValid(true); // Reset validation
		setSaveError(null); // Clear any save errors
	};

	// Load initial data (API Key and History)
	useEffect(() => {
		// Load API Key
		const fetchedApiKey = localStorageFetchService();
		if (fetchedApiKey) {
			// Validate the fetched key as well
			if (apiKeyRegex.test(fetchedApiKey)) {
				setStoredApiKey(fetchedApiKey);
				setApiKeyInput(fetchedApiKey); // Pre-fill input if valid key exists
				setIsApiKeyValid(true);
			} else {
				// Handle case where an invalid key was somehow stored previously
				console.warn("Invalid API key found in storage.");
				setStoredApiKey(null);
				setApiKeyInput(""); // Clear input
				setIsApiKeyValid(false); // Mark as invalid
				setSaveError(
					"Invalid API key loaded from storage. Please enter a valid key.",
				);
			}
		}
		// Load Conversion History
		const loadedHistory = loadConversionHistoryService();
		setConversionHistory(loadedHistory);
	}, []);

	const swapCurrencies = () => {
		const temp = fromCurrency;
		setFromCurrency(toCurrency);
		setToCurrency(temp);
	};

	// Function to handle repeating a conversion from history
	const handleRepeatConversion = (entry: ConversionHistoryEntry) => {
		setFromCurrency(entry.fromCurrency);
		setToCurrency(entry.toCurrency);
		setAmount(entry.amount);
		// Optional: Trigger fetchRate immediately after setting state?
		// fetchRate(); // Uncomment this if you want to recalculate automatically
	};

	return (
		<>
			<CurrencySelector
				value={fromCurrency}
				onChange={handleFromCurrency}
				where={"from"}
			/>

			<ButtonPrimary onClick={() => swapCurrencies()}>
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
				onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
					setAmount(Number(event.target.value))
				}
			/>
			<Field
				label={"Api Key"}
				// Determine validation state based on input validity and presence
				validationState={
					saveError || (!isApiKeyValid && apiKeyInput !== "")
						? "error" // Prioritize showing save errors or format errors
						: storedApiKey && apiKeyInput === storedApiKey
							? "success" // Valid stored key shown
							: isApiKeyValid && apiKeyInput !== ""
								? "warning" // Valid format, but not saved or doesn't match stored
								: "none" // Default state (e.g., empty input, no stored key)
				}
				validationMessage={
					saveError
						? saveError // Show save error first
						: !isApiKeyValid && apiKeyInput !== ""
							? "Invalid format. Must start with fca_live_ + 40 alphanumeric chars." // Updated length in message
							: storedApiKey && apiKeyInput === storedApiKey
								? "API Key is valid and stored."
								: isApiKeyValid && apiKeyInput !== ""
									? "Valid format. Press Save to store this key." // Warning message
									: apiKeyInput === "" && !storedApiKey
										? "API Key is required."
										: "" // Default: no message
				}
				required
				value={apiKeyInput}
				onChange={handleApiKeyChange} // Use the new handler
			/>
			{/* Informational message about obtaining the API Key */}
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
			{/* Display rate with check for number type */}
			<Label
				text={`Rate: ${typeof rate === "number" ? rate.toFixed(4) : "--"}`}
				size={"large"}
			/>
			{typeof rate === "number" && (
				<Label
					text={`${amount} ${fromCurrency} = ${(amount * rate).toFixed(2)} ${toCurrency}`}
					size={"large"}
				/>
			)}

			<ButtonPrimary onClick={() => fetchRate()} disabled={!storedApiKey}>
				<span>Calculate</span>
				<MoneyCalculatorFilled style={{ fontSize: "24px" }} />
			</ButtonPrimary>

			<ButtonPrimary
				onClick={saveApiKey}
				disabled={
					!isApiKeyValid || apiKeyInput === "" || apiKeyInput === storedApiKey
				}
			>
				<span>Save Data</span>
				<SaveFilled style={{ fontSize: "24px" }} />
			</ButtonPrimary>

			<ButtonDanger onClick={() => clearApiKey()}>
				<span>Clear Data</span>
				<DeleteFilled style={{ fontSize: "24px" }} />
			</ButtonDanger>

			{/* Render the Conversion History component */}
			<ConversionHistory
				history={conversionHistory}
				onRepeat={handleRepeatConversion}
			/>
		</>
	);
}
export default App;
