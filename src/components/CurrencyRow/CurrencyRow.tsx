import {
	Field,
	makeStyles,
	shorthands,
	tokens,
	Button,
} from "@fluentui/react-components";
import { ArrowSwapRegular } from "@fluentui/react-icons";
import React from "react";

import { CurrencySelector } from "../CurrencySelector/CurrencySelector";

// Styles for the row
const useStyles = makeStyles({
	container: {
		display: "flex", // Use Flexbox
		flexDirection: "column", // Always stack vertically
		alignItems: "stretch", // Stretch items to fill width
		...shorthands.gap(tokens.spacingVerticalS), // Keep small vertical gap
	},
	swapButton: {
		// Align the button to the right end instead of center
		alignSelf: "flex-end",
		backgroundColor: tokens.colorBrandBackground,
		color: tokens.colorNeutralForegroundOnBrand,
		width: "32px",
		height: "32px",
		":hover": {
			backgroundColor: tokens.colorBrandBackgroundHover,
		},
		":active": {
			backgroundColor: tokens.colorBrandBackgroundPressed,
		},
		":focus-visible": {
			outlineColor: tokens.colorBrandStroke1,
		},
	},
});

// Required props
interface CurrencyRowProps {
	fromCurrency: string;
	toCurrency: string;
	onFromChange: (value: string) => void;
	onToChange: (value: string) => void;
	onSwap: () => void;
}

export const CurrencyRow: React.FC<CurrencyRowProps> = ({
	fromCurrency,
	toCurrency,
	onFromChange,
	onToChange,
	onSwap,
}) => {
	const styles = useStyles();

	return (
		<div className={styles.container}>
			{/* From Field wrapping CurrencySelector */}
			<Field label="From" size="large">
				<CurrencySelector
					value={fromCurrency}
					onChange={onFromChange}
					where={"from"}
				/>
			</Field>

			{/* Swap Button - Circular, relies on only having icon prop */}

			{/* To Field wrapping CurrencySelector */}
			<Field label="To" size="large">
				<CurrencySelector
					value={toCurrency}
					onChange={onToChange}
					where={"to"}
				/>
			</Field>
			<Button
				appearance="primary"
				size="medium"
				shape="circular"
				className={styles.swapButton}
				onClick={onSwap}
				aria-label="Swap currencies"
				icon={<ArrowSwapRegular />}
			/>
		</div>
	);
};
