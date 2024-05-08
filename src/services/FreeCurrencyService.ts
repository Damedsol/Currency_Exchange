export interface FreeCurrencyService {
	rate: number | null;
}

interface FreeCurrencyArg {
	fromCurrency: string | unknown;
	toCurrency: string | unknown;
	apiKey: string | unknown;
}

export async function FreeCurrencyService({
	fromCurrency,
	toCurrency,
	apiKey,
}: FreeCurrencyArg): Promise<FreeCurrencyService | null> {
	const API_URL = "https://api.freecurrencyapi.com/v1/latest";
	const Params = `apikey=${apiKey}&currencies=${toCurrency}&base_currency=${fromCurrency}`;

	if (
		typeof apiKey !== "string" ||
		typeof fromCurrency !== "string" ||
		typeof toCurrency !== "string"
	)
		return null;

	if (!apiKey || !fromCurrency || !toCurrency) return null;

	const response = await fetch(`${API_URL}?${Params}`);
	const data = await response.json();
	return data.data[toCurrency];
}
