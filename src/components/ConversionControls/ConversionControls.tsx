import {
	Button,
	Divider,
	Field,
	Input,
	makeStyles,
	shorthands,
	tokens,
} from "@fluentui/react-components";
import { MoneyCalculatorFilled } from "@fluentui/react-icons";
import React from "react";
import type { ConversionHistoryEntry } from "../../services/LocalStorage";
import { ActionButtons } from "../ActionButtons/ActionButtons";
import { CurrencyRow } from "../CurrencyRow/CurrencyRow";
import { ResultSection } from "../ResultSection/ResultSection";

// Define RateSource type
type RateSource = "idle" | "cache" | "api" | "error" | "loading";

// Styles specific to the controls section, adapted from App.tsx
const useStyles = makeStyles({
	leftColumn: {
		display: "flex",
		flexDirection: "column",
		flexBasis: "30%", // Adjust based on desired layout
		...shorthands.gap(tokens.spacingVerticalL),
	},
	controlsSection: {
		display: "flex",
		flexDirection: "column",
		...shorthands.gap(tokens.spacingVerticalL),
	},
	amountField: {
		"& input": {
			transitionProperty: "outline, box-shadow",
			transitionDuration: tokens.durationNormal,
			transitionTimingFunction: tokens.curveEasyEase,
			outlineStyle: "none",
		},
		":focus-within": {
			"& input": {
				outlineColor: tokens.colorCompoundBrandStroke,
				outlineStyle: "solid",
				outlineWidth: tokens.strokeWidthThick,
			},
		},
	},
	primaryActionButton: {
		marginTop: tokens.spacingVerticalS,
		backgroundColor: tokens.colorBrandBackground,
		color: tokens.colorNeutralForegroundOnBrand,
		...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalL),
		fontWeight: tokens.fontWeightSemibold,
		":hover": {
			backgroundColor: tokens.colorBrandBackgroundHover,
		},
		":active": {
			backgroundColor: tokens.colorBrandBackgroundPressed,
		},
		":disabled": {
			backgroundColor: tokens.colorNeutralBackgroundDisabled,
			color: tokens.colorNeutralForegroundDisabled,
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

interface ConversionControlsProps {
	fromCurrency: string;
	toCurrency: string;
	amount: number;
	rate: number;
	rateSource: RateSource;
	storedApiKey: string | null;
	isApiKeyValid: boolean;
	apiKeyInput: string;
	conversionHistory: ConversionHistoryEntry[]; // Needed for ActionButtons isHistoryEmpty prop
	handleFromCurrency: (value: string) => void;
	handleToCurrency: (value: string) => void;
	swapCurrencies: () => void;
	handleAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	handleClearCacheAndFetch: () => void;
	fetchRate: () => Promise<void>;
	clearConversionHistory: () => void; // Propagate down to ActionButtons
	clearApiAndCache: () => void; // Propagate down to ActionButtons
}

export const ConversionControls: React.FC<ConversionControlsProps> = ({
	fromCurrency,
	toCurrency,
	amount,
	rate,
	rateSource,
	storedApiKey,
	isApiKeyValid,
	apiKeyInput,
	conversionHistory,
	handleFromCurrency,
	handleToCurrency,
	swapCurrencies,
	handleAmountChange,
	handleClearCacheAndFetch,
	fetchRate,
	clearConversionHistory,
	clearApiAndCache,
}) => {
	const styles = useStyles();

	return (
		<section
			aria-labelledby="conversion-controls-heading"
			className={styles.leftColumn}
		>
			<h1 id="conversion-controls-heading" className={styles.visuallyHidden}>
				Currency Converter Controls
			</h1>

			{/* Conversion Block */}
			<div className={styles.controlsSection}>
				<CurrencyRow
					fromCurrency={fromCurrency}
					toCurrency={toCurrency}
					onFromChange={handleFromCurrency}
					onToChange={handleToCurrency}
					onSwap={swapCurrencies}
				/>
				<Field label="Amount" size="large" className={styles.amountField}>
					<Input
						type="number"
						value={amount.toString()}
						onChange={handleAmountChange}
						appearance="outline"
						size="large"
					/>
				</Field>
				<ResultSection
					rate={typeof rate === "number" ? rate : 0}
					rateSource={rateSource}
					amount={amount}
					fromCurrency={fromCurrency}
					toCurrency={toCurrency}
					onRefreshRates={handleClearCacheAndFetch}
				/>
			</div>

			<Button
				appearance="primary"
				icon={<MoneyCalculatorFilled aria-hidden="true" />} // Hide decorative icon
				onClick={fetchRate}
				disabled={!storedApiKey || amount <= 0 || rateSource === "loading"}
				className={styles.primaryActionButton}
			>
				{rateSource === "loading" ? "Calculating..." : "Calculate"}
			</Button>

			<Divider />

			<div className={styles.controlsSection}>
				<ActionButtons
					storedApiKey={storedApiKey}
					amount={amount} // Pass necessary props
					rateSource={rateSource}
					isApiKeyValid={isApiKeyValid}
					apiKeyInput={apiKeyInput}
					isHistoryEmpty={conversionHistory.length === 0}
					onClearHistory={clearConversionHistory}
					onClearAll={clearApiAndCache}
				/>
			</div>
		</section>
	);
};
