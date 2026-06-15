import {
	Button,
	makeStyles,
	shorthands,
	tokens,
} from "@fluentui/react-components";
import { ArrowSwapRegular } from "@fluentui/react-icons";
import React, { useEffect, useState } from "react";

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
		alignSelf: "flex-end",
		backgroundColor: tokens.colorBrandBackground,
		color: tokens.colorNeutralForegroundOnBrand,
		minWidth: "44px",
		minHeight: "44px",
		fontWeight: tokens.fontWeightMedium,
		":hover": {
			backgroundColor: tokens.colorNeutralBackground1,
			color: tokens.colorCompoundBrandStroke,
			...shorthands.borderColor(tokens.colorCompoundBrandStroke),
		},
		":active": {
			backgroundColor: tokens.colorBrandBackgroundPressed,
			transform: "scale(0.98)",
		},
		":focus-visible": {
			outlineColor: tokens.colorBrandStroke1,
		},
	},
	visuallyHidden: {
		clip: "rect(0 0 0 0)",
		clipPath: "inset(50%)",
		height: "1px",
		overflow: "hidden",
		position: "absolute",
		whiteSpace: "nowrap",
		width: "1px",
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

export const CurrencyRow: React.FC<CurrencyRowProps> = React.memo(
	({ fromCurrency, toCurrency, onFromChange, onToChange, onSwap }) => {
		const styles = useStyles();
		const [swapMessage, setSwapMessage] = useState("");

		const handleSwap = () => {
			onSwap();
			setSwapMessage(`Swapped currencies: ${fromCurrency} ↔ ${toCurrency}`);
		};

		useEffect(() => {
			if (!swapMessage) return;
			const timer = setTimeout(() => setSwapMessage(""), 3000);
			return () => clearTimeout(timer);
		}, [swapMessage]);

		return (
			<div className={styles.container}>
				{/* From CurrencySelector (already includes label) */}
				<CurrencySelector
					value={fromCurrency}
					onChange={onFromChange}
					where={"from"}
				/>

				{/* Swap Button - Place between selectors */}
				<Button
					appearance="primary"
					size="medium"
					shape="circular"
					className={styles.swapButton}
					onClick={handleSwap}
					aria-label="Swap currencies"
					icon={<ArrowSwapRegular />}
				/>

				{/* To CurrencySelector (already includes label) */}
				<CurrencySelector
					value={toCurrency}
					onChange={onToChange}
					where={"to"}
				/>

				<div role="status" aria-live="polite" className={styles.visuallyHidden}>
					{swapMessage}
				</div>
			</div>
		);
	},
);
