import { MoneyCalculatorFilled } from "@fluentui/react-icons";
import type React from "react";
import { useState } from "react";
import { ButtonBase } from "./components/Button/ButtonBase.tsx";
import { CurrencySelector } from "./components/CurrencySelector/CurrencySelector.tsx";
import { Field } from "./components/Field/Field.tsx";
import { Label } from "./components/Label/Label.tsx";
import { FreeCurrency } from "./services/FreeCurrency";

function App() {
	const [fromCurrency, setFromCurrency] = useState<string>("EUR");
	const [toCurrency, setToCurrency] = useState<string>("USD");
	const [apiKey, setApiKey] = useState<string | null>(null);
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

			<ButtonBase
				shape={"rounded"}
				appearance={"primary"}
				onClick={fetchRate}
				disabled={!apiKey}
			>
				Calculate
				<span>
					<MoneyCalculatorFilled style={{ fontSize: "24px" }} />
				</span>
			</ButtonBase>

			<ButtonBase
				shape={"rounded"}
				appearance={"primary"}
				onClick={() => saveApiKey(apiKey as string)}
			>
				Save
			</ButtonBase>

			<ButtonBase
				shape={"rounded"}
				appearance={"primary"}
				onClick={clearApiKey}
			>
				Clear
			</ButtonBase>
		</>
	);
}
export default App;
