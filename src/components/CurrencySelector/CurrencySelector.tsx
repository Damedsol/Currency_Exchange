import { Select, useId, makeStyles } from "@fluentui/react-components";
import type React from "react";
import data from "./currencySelectorData.json";

interface Currency {
	symbol: string;
	name: string;
	code: string;
}

const useStyles = makeStyles({
	select: {
		width: '100%',
		maxWidth: '100%',
	}
});

export function CurrencySelector(props: {
	onChange: (value: string) => void;
	value: string;
	where: "from" | "to";
}): React.JSX.Element {
	const styles = useStyles();
	const id = useId();
	const handleInputChange = (event: { target: { value: string } }) => {
		props.onChange(event.target.value);
	};
	const TransformData: Currency[] = Array.from(
		Object.values(data as Record<string, Currency>),
	);

	return (
		<Select
			className={styles.select}
			id={id}
			value={props.value}
			onChange={handleInputChange}
			appearance={"outline"}
			size={"large"}
			aria-label={props.where === 'from' ? 'Select currency to convert from' : 'Select currency to convert to'}
		>
			{TransformData.map((item) => (
				<option key={item.code} value={item.code}>
					{item.symbol} - {item.name}
				</option>
			))}
		</Select>
	);
}
