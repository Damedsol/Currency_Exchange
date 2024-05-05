import { useEffect, useState } from "react";
import { CurrencySelector } from "./components/CurrencySelector.tsx";

function App() {
	const [fromCurrency, setFromCurrency] = useState<string>("EUR");
	const [toCurrency, setToCurrency] = useState<string>("USD");
	const [apiKey, setApiKey] = useState<string | null>(null);
	const [rate, setRate] = useState<number | null>(null);

	useEffect(() => {
		if (!apiKey || !fromCurrency || !toCurrency) {
			return;
		}
		async function fetchRate() {
			const response = await fetch(
				`https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&currencies=${toCurrency}&base_currency=${fromCurrency}`,
			);
			const data = await response.json();
			setRate(data.data[toCurrency]);
		}

		fetchRate();
	}, [fromCurrency, toCurrency, apiKey]);

	console.log(rate);

	const handleFromCurrency = (value: string) => setFromCurrency(value);
	const handleToCurrency = (value: string) => setToCurrency(value);

	return (
		<>
			<CurrencySelector
				value={fromCurrency}
				onValueChange={handleFromCurrency}
			/>
			<p>{fromCurrency}</p>
			<CurrencySelector value={toCurrency} onValueChange={handleToCurrency} />
			<p>{toCurrency}</p>

			<p>{apiKey ? "API KEY SET" : "API KEY NOT SET"}</p>
			<input
				value={apiKey ? apiKey : ""}
				type={"password"}
				onChange={(event) => setApiKey(event.target.value)}
			/>

			<p>Rate: {rate}</p>
		</>
	);
}

export default App;
