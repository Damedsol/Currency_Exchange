import { Select, useId } from "@fluentui/react-components";
import type React from "react";
import data from "./currencySelectorData.json";

interface Currency {
	symbol: string;
	name: string;
	code: string;
}

export function CurrencySelector(props: {
	onChange: (value: string) => void;
	value: string;
	where: "from" | "to";
}): React.JSX.Element {
	const id = useId();
	const handleInputChange = (event: { target: { value: string } }) => {
		props.onChange(event.target.value);
	};
	const TransformData: Currency[] = Array.from(
		Object.values(data as Record<string, Currency>),
	);

	return (
		<>
			<label htmlFor={id}>
				{props.where.charAt(0).toUpperCase() +
					props.where.slice(1).toLowerCase()}
			</label>
			<Select
				id={id}
				value={props.value}
				onChange={handleInputChange}
				appearance={"filled-darker"}
				size={"large"}
			>
				{TransformData.map((item) => (
					<option key={item.code} value={item.code}>
						{item.symbol} - {item.name}
					</option>
				))}
			</Select>
		</>
	);
}
