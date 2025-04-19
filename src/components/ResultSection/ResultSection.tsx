import {
	Label,
	makeStyles,
	shorthands,
	tokens,
	Spinner,
	Button,
} from "@fluentui/react-components";
import { ArrowClockwiseRegular } from "@fluentui/react-icons";
import React from "react";

import { RateSourceIndicator } from "../RateSourceIndicator/RateSourceIndicator";

// Section styles
const useStyles = makeStyles({
	container: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start", // Align left
		...shorthands.gap(tokens.spacingVerticalS),
		minHeight: "50px", // Ensure container has some height even when empty
	},
	rateRow: {
		display: "flex",
		alignItems: "center",
		...shorthands.gap(tokens.spacingHorizontalS), // Increased gap slightly
		height: "24px", // Set fixed height to prevent layout shifts during loading
	},
	spinner: {
		marginLeft: tokens.spacingHorizontalXS, // Space between indicator and spinner
	},
	refreshButton: {
		marginRight: tokens.spacingHorizontalS,
		minWidth: "auto",
		height: "28px",
		width: "28px",
		color: tokens.colorBrandForeground1,
		backgroundColor: tokens.colorNeutralBackground1,
		...shorthands.borderRadius("50%"),
		...shorthands.padding(0),
		":hover": {
			backgroundColor: tokens.colorNeutralBackground1Hover,
			color: tokens.colorBrandForeground1,
		},
		":active": {
			backgroundColor: tokens.colorNeutralBackground1Pressed,
		},
		":disabled": {
			color: tokens.colorNeutralForegroundDisabled,
			backgroundColor: tokens.colorNeutralBackgroundDisabled,
		},
	},
});

// Required props
type RateSource = "idle" | "cache" | "api" | "error" | "loading";
interface ResultSectionProps {
	rate: number | "--";
	rateSource: RateSource;
	amount: number;
	fromCurrency: string;
	toCurrency: string;
	onRefreshRates: () => void;
}

export const ResultSection: React.FC<ResultSectionProps> = ({
	rate,
	rateSource,
	amount,
	fromCurrency,
	toCurrency,
	onRefreshRates,
}) => {
	const styles = useStyles();

	const showResult = typeof rate === "number" && amount > 0;

	return (
		<div className={styles.container}>
			{/* Row for rate and indicator */}
			<div className={styles.rateRow}>
				<Button
					appearance="subtle"
					size="small"
					icon={<ArrowClockwiseRegular />}
					onClick={onRefreshRates}
					disabled={rateSource === "loading"}
					title="Clear cached rates and fetch live data"
					className={styles.refreshButton}
					iconPosition="before"
				/>
				<Label
					size={"large"}
					// Hide rate label during loading for cleaner look?
					style={{
						visibility: rateSource === "loading" ? "hidden" : "visible",
					}}
				>
					{`Rate: ${typeof rate === "number" ? rate.toFixed(4) : "--"}`}
				</Label>
				<RateSourceIndicator rateSource={rateSource} />
				{/* Show spinner only when loading */}
				{rateSource === "loading" && (
					<Spinner size="tiny" className={styles.spinner} />
				)}
			</div>
			{/* Show conversion result if rate is valid and not loading */}
			<Label
				size={"large"}
				style={{
					visibility:
						showResult && rateSource !== "loading" ? "visible" : "hidden",
				}}
			>
				{showResult
					? `${amount} ${fromCurrency} = ${(amount * rate).toFixed(2)} ${toCurrency}`
					: "Result placeholder"}{" "}
				{/* Placeholder to maintain height */}
			</Label>
		</div>
	);
};
