import { useState } from "react";
import { CurrencySelector } from "./components/CurrencySelector.tsx";

function App() {
	const [fromCurrency, setFromCurrency] = useState<string>("EUR");
	const [toCurrency, setToCurrency] = useState<string>("USD");
	const [apiKey, setApiKey] = useState<string | null>(null);

	const handleFromCurrency = (value: string) => setFromCurrency(value);
	const handleToCurrency = (value: string) => setToCurrency(value);

	return (
		<>
			<CurrencySelector onValueChange={handleFromCurrency} />
			<p>{fromCurrency}</p>
			<CurrencySelector onValueChange={handleToCurrency} />
			<p>{toCurrency}</p>

			<p>{apiKey ? "API KEY SET" : "API KEY NOT SET"}</p>
			<input
				value={apiKey ? apiKey : ""}
				type={"password"}
				onChange={(event) => setApiKey(event.target.value)}
			/>
		</>
	);
}

export default App;
