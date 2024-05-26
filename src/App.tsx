import {DeleteFilled, MoneyCalculatorFilled, SaveFilled,} from "@fluentui/react-icons";
import type React from "react";
import {useEffect, useState} from "react";
import {ButtonDanger} from "./components/Buttons/danger/ButtonDanger.tsx";
import {ButtonPrimary} from "./components/Buttons/primary/ButtonPrimary.tsx";
import {CurrencySelector} from "./components/CurrencySelector/CurrencySelector.tsx";
import {Field} from "./components/Field/Field.tsx";
import {Label} from "./components/Label/Label.tsx";
import {FreeCurrency} from "./services/FreeCurrency";
import {clearLocalStorageAndDB, localStorageFetchService, localStorageStoreService,} from "./services/LocalStorage.ts";

function App() {
	const [fromCurrency, setFromCurrency] = useState<string>("EUR");
	const [toCurrency, setToCurrency] = useState<string>("USD");
	const [apiKey, setApiKey] = useState<string | null | undefined>(null);
	const [rate, setRate] = useState<FreeCurrency | "--">("--");

	const handleFromCurrency = (value: string) => setFromCurrency(value);
	const handleToCurrency = (value: string) => setToCurrency(value);

	async function fetchRate(): Promise<void> {
		const response = await FreeCurrency({
			fromCurrency,
			toCurrency,
			apiKey,
		});
		if (response) {
			setRate(response);
		}
	}

	async function saveApiKey(apiKey: string | null): Promise<void> {
		if (apiKey) {
			await localStorageStoreService(apiKey);
			return;
		}
	}
	const clearApiKey = async () => {
		await clearLocalStorageAndDB();
	};
	useEffect(() => {
		localStorageFetchService().then((apiKey) => {
			if (apiKey) {
				setApiKey(apiKey as string);
			}
		});
	}, []);

	return (
		<>
			<CurrencySelector
				value={fromCurrency}
				onChange={handleFromCurrency}
				where={"from"}
			/>
			<CurrencySelector
				value={toCurrency}
				onChange={handleToCurrency}
				where={"to"}
			/>
			<Field
				label={"Api Key"}
				validationState={apiKey ? "success" : "error"}
				validationMessage={apiKey ? "Api Key is set" : "Api Key is required"}
				required
				value={apiKey || ""}
				onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
					setApiKey(event.target.value)
				}
			/>
			<Label text={`Rate: ${rate ? rate.toString() : "--"}`} size={"large"} />

			<ButtonPrimary onClick={() => fetchRate()} disabled={!apiKey}>
				<span>Calculate</span>
				<MoneyCalculatorFilled style={{ fontSize: "24px" }} />
			</ButtonPrimary>

			<ButtonPrimary onClick={() => saveApiKey(apiKey as string)}>
				<span>Save Data</span>
				<SaveFilled style={{ fontSize: "24px" }} />
			</ButtonPrimary>

			<ButtonDanger onClick={() => clearApiKey()}>
				<span>Clear Data</span>
				<DeleteFilled style={{ fontSize: "24px" }} />
			</ButtonDanger>
		</>
	);
}
export default App;
