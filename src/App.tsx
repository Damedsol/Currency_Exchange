import { useState } from "react";
import { CurrencySelector } from "./components/CurrencySelector";
import { FreeCurrencyService } from "./services/FreeCurrencyService";

function App() {
	const [fromCurrency, setFromCurrency] = useState<string>("EUR");
	const [toCurrency, setToCurrency] = useState<string>("USD");
	const [apiKey, setApiKey] = useState<string | null>(null);
	const [rate, setRate] = useState<FreeCurrencyService | null>(null);

	const handleFromCurrency = (value: string) => setFromCurrency(value);
	const handleToCurrency = (value: string) => setToCurrency(value);

	async function fetchRate() {
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
				onValueChange={handleFromCurrency}
			/>
			<p>{fromCurrency}</p>
			<CurrencySelector value={toCurrency} onValueChange={handleToCurrency} />
			<p>{toCurrency}</p> <p>{apiKey ? "API KEY SET" : "API KEY NOT SET"}</p>
			<input
				value={apiKey ? apiKey : ""}
				type={"password"}
				onChange={(event) => setApiKey(event.target.value)}
			/>
			<p>Rate: {rate ? rate.rate : null}</p>
			<button type="button" onClick={fetchRate}>
				Obtener Cambio
			</button>
		</>
	);
}

export default App;
