import { Label, makeStyles, Select, useId } from "@fluentui/react-components";
import React from "react";
import data from "./currencySelectorData.json";

interface Currency {
	symbol: string;
	name: string;
	code: string;
}

const useStyles = makeStyles({
	select: {
		width: "100%",
		maxWidth: "100%",
	},
	root: {
		display: "flex",
		flexDirection: "column",
		gap: "2px",
	},
});

export const CurrencySelector: React.FC<{
	onChange: (value: string) => void;
	value: string;
	where: "from" | "to";
}> = React.memo(function CurrencySelector(props) {
	const styles = useStyles();
	const selectId = useId("currency-select");
	const handleInputChange = (
		event: React.ChangeEvent<HTMLSelectElement>,
	): void => {
		props.onChange(event.target.value);
	};
	const TransformData: Currency[] = Array.from(
		Object.values(data as Record<string, Currency>),
	);

	const labelText = props.where === "from" ? "Convert From" : "Convert To";

	return (
		<div className={styles.root}>
			<Label htmlFor={selectId}>{labelText}</Label>
			<Select
				className={styles.select}
				id={selectId}
				value={props.value}
				onChange={handleInputChange}
				appearance={"outline"}
				size={"large"}
			>
				{TransformData.map((item) => (
					<option key={item.code} value={item.code}>
						{item.symbol} - {item.name}
					</option>
				))}
			</Select>
		</div>
	);
});
