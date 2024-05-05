import type React from "react";
import data from "./currencySelectorData.json";

interface Currency {
	symbol: string;
	name: string;
	code: string;
}

export function CurrencySelector(props: {
	onValueChange: (value: string) => void;
}): React.JSX.Element {
	const handleInputChange = (event: { target: { value: string } }) => {
		props.onValueChange(event.target.value);
	};
	const TransformData: Currency[] = Array.from(
		Object.values(data as Record<string, Currency>),
	);

	return (
		<>
			<select onChange={handleInputChange}>
				{TransformData.map((item) => (
					<option key={item.code} value={item.code}>
						{item.symbol} - {item.name}
					</option>
				))}
			</select>
		</>
	);
}
