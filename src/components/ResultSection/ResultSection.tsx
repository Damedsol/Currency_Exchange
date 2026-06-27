import {
	Button,
	makeStyles,
	Spinner,
	shorthands,
	Text,
	Tooltip,
	tokens,
} from "@fluentui/react-components";
import { ArrowClockwiseRegular } from "@fluentui/react-icons";
import React from "react";

import type { CurrencyMetadata } from "../../types";
import { RateSourceIndicator } from "../RateSourceIndicator/RateSourceIndicator";

// Define rate source type
type RateSource = "idle" | "cache" | "api" | "error" | "loading";

interface ResultSectionProps {
	rate: number;
	rateSource: RateSource;
	amount: number;
	fromCurrency: string;
	toCurrency: string;
	onRefreshRates: () => void;
	currencies: Record<string, CurrencyMetadata> | undefined;
}

// Define styles
const useStyles = makeStyles({
	container: {
		display: "flex",
		flexDirection: "column",
		...shorthands.gap(tokens.spacingVerticalM),
		marginTop: tokens.spacingVerticalM,
	},
	resultRow: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		transitionProperty: "opacity",
		transitionDuration: tokens.durationNormal,
		transitionTimingFunction: tokens.curveEasyEase,
	},
	resultAmount: {
		fontSize: tokens.fontSizeBase600,
		fontWeight: "600",
	},
	rateRow: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: tokens.spacingVerticalXS,
	},
	rateValue: {
		display: "flex",
		alignItems: "center",
		...shorthands.gap(tokens.spacingHorizontalS),
	},
	refreshButton: {
		minWidth: "unset",
	},
});

/**
 * Formats a number using decimal_digits from currency metadata or a fallback.
 * Falls back to 2 decimal places when metadata is unavailable.
 */
export const formatCurrencyAmount = (
	num: number,
	currencyCode: string,
	currencies?: Record<string, CurrencyMetadata>,
): string => {
	if (num === 0 || isNaN(num)) {
		return "--";
	}

	const meta = currencies?.[currencyCode];
	const digits = meta?.decimal_digits ?? 2;

	return num.toLocaleString(undefined, {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits,
	});
};

export const ResultSection = React.memo(
	({
		rate,
		rateSource,
		amount,
		fromCurrency,
		toCurrency,
		onRefreshRates,
		currencies,
	}: ResultSectionProps): React.JSX.Element => {
		const styles = useStyles();

		// Calculate the conversion result
		const calculateResult = (): string => {
			// If the rate or amount is not available, return placeholder
			if (rate === 0 || amount === 0) {
				return "--";
			}
			// Calculate and format using toCurrency's decimal digits
			return formatCurrencyAmount(amount * rate, toCurrency, currencies);
		};

		const isLoading = rateSource === "loading";

		return (
			<div
				className={styles.container}
				aria-live={rateSource === "error" ? "assertive" : "polite"}
				aria-atomic="true"
			>
				<div className={styles.resultRow}>
					<Text size={200}>Result</Text>
					{isLoading ? (
						<Spinner size="small" label="Calculating..." />
					) : (
						<Text size={600} weight="semibold" className={styles.resultAmount}>
							{calculateResult()}
						</Text>
					)}
				</div>

				<div className={styles.rateRow}>
					<div className={styles.rateValue}>
						<Text size={200}>Rate: </Text>
						<Text size={200} weight="medium">
							1 {fromCurrency} ={" "}
							{formatCurrencyAmount(rate, toCurrency, currencies)} {toCurrency}
						</Text>
						<RateSourceIndicator rateSource={rateSource} />
					</div>
					<Tooltip content="Refresh rates from API" relationship="description">
						<Button
							appearance="subtle"
							icon={<ArrowClockwiseRegular />}
							size="small"
							onClick={onRefreshRates}
							aria-label="Refresh rates"
							className={styles.refreshButton}
							disabled={isLoading}
						/>
					</Tooltip>
				</div>
			</div>
		);
	},
);
