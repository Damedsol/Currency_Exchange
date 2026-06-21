import {
	Label,
	makeStyles,
	Select,
	Text,
	tokens,
	useId,
} from "@fluentui/react-components";
import React from "react";

import type { CurrencyMetadata } from "../../types";

const useStyles = makeStyles({
	select: {
		width: "100%",
		maxWidth: "100%",
		minHeight: "44px",
		fontFamily: tokens.fontFamilyMonospace,
	},
	root: {
		display: "flex",
		flexDirection: "column",
		gap: "2px",
	},
	hint: {
		fontSize: tokens.fontSizeBase200,
		color: tokens.colorNeutralForeground3,
		marginTop: tokens.spacingVerticalXS,
		paddingLeft: tokens.spacingHorizontalXS,
	},
});

interface CurrencySelectorProps {
	onChange: (value: string) => void;
	value: string;
	where: "from" | "to";
	currencies: Record<string, CurrencyMetadata> | undefined;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = React.memo(
	function CurrencySelector(props) {
		const styles = useStyles();
		const selectId = useId("currency-select");
		const handleInputChange = (
			event: React.ChangeEvent<HTMLSelectElement>,
		): void => {
			props.onChange(event.target.value);
		};

		const currencyList = Object.values(props.currencies ?? {});
		const isEmpty = currencyList.length === 0;

		const labelText = props.where === "from" ? "Convert From" : "Convert To";

		return (
			<div className={styles.root}>
				<Label htmlFor={selectId}>{labelText}</Label>
				{isEmpty ? (
					<>
						<Select
							disabled
							className={styles.select}
							id={selectId}
							appearance={"outline"}
							size={"large"}
						>
							<option value="">---</option>
						</Select>
						<Text className={styles.hint}>
							Set an API key and click <strong>Update</strong> to load
							currencies.
						</Text>
					</>
				) : (
					<Select
						className={styles.select}
						id={selectId}
						value={props.value}
						onChange={handleInputChange}
						appearance={"outline"}
						size={"large"}
					>
						{currencyList.map((item) => (
							<option key={item.code} value={item.code}>
								{item.symbol_native ?? item.symbol} - {item.name}
							</option>
						))}
					</Select>
				)}
			</div>
		);
	},
);
