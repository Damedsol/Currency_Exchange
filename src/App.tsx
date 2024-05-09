import { useState } from "react";
import { ButtonBase } from "./components/Button/ButtonBase.tsx";
import { CurrencySelector } from "./components/CurrencySelector/CurrencySelector.tsx";
import { FreeCurrencyService } from "./services/FreeCurrencyService";

function App() {
	const [fromCurrency, setFromCurrency] = useState<string>("EUR");
	const [toCurrency, setToCurrency] = useState<string>("USD");
	const [apiKey, setApiKey] = useState<string | null>(null);
	const [rate, setRate] = useState<FreeCurrencyService | "--">("--");

	const handleFromCurrency = (value: string) => setFromCurrency(value);
	const handleToCurrency = (value: string) => setToCurrency(value);

	async function fetchRate(): Promise<void> {
		const response = await FreeCurrencyService({
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
			<p>{apiKey ? "API KEY SET" : "API KEY NOT SET"}</p>
			<input
				value={apiKey ? apiKey : ""}
				type={"password"}
				onChange={(event) => setApiKey(event.target.value)}
			/>
			<p>Rate: {rate ? rate.toString() : "--"}</p>
			<ButtonBase shape={"rounded"} appearance={"primary"} onClick={fetchRate}>
				Obtener Cambio
			</ButtonBase>
		</>
	);
}

export default App;
