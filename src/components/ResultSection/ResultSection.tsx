import {
	Text,
	makeStyles,
	shorthands,
	tokens,
	Button,
	Tooltip,
} from "@fluentui/react-components";
import { ArrowClockwiseRegular } from "@fluentui/react-icons";

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

const formatNumber = (
	num: number,
	minDecimals = 2,
	maxDecimals = 3,
): string => {
	// Return "--" for 0 or NaN
	if (num === 0 || isNaN(num)) {
		return "--";
	}

	return num.toLocaleString(undefined, {
		minimumFractionDigits: minDecimals,
		maximumFractionDigits: maxDecimals,
	});
};

export const ResultSection = ({
	rate,
	rateSource,
	amount,
	fromCurrency,
	toCurrency,
	onRefreshRates,
}: ResultSectionProps): React.JSX.Element => {
	const styles = useStyles();

	// Calculate the conversion result
	const calculateResult = (): string => {
		// If the rate or amount is not available, return placeholder
		if (rate === 0 || amount === 0) {
			return "--";
		}
		// Calculate and format
		return formatNumber(amount * rate);
	};

	return (
		<div className={styles.container}>
			<div className={styles.resultRow} aria-live="polite" aria-atomic="true">
				<Text size={200}>Result</Text>
				<Text size={600} weight="semibold" className={styles.resultAmount}>
					{calculateResult()}
				</Text>
			</div>

			<div className={styles.rateRow}>
				<div className={styles.rateValue} aria-live="polite" aria-atomic="true">
					<Text size={200}>Rate: </Text>
					<Text size={200} weight="medium">
						1 {fromCurrency} = {formatNumber(rate)} {toCurrency}
					</Text>
					<RateSourceIndicator rateSource={rateSource} />
				</div>
				<Tooltip content="Refresh rates from API" relationship="label">
					<Button
						appearance="subtle"
						icon={<ArrowClockwiseRegular />}
						size="small"
						onClick={onRefreshRates}
						aria-label="Refresh rates"
						className={styles.refreshButton}
						disabled={rateSource === "loading"}
					/>
				</Tooltip>
			</div>
		</div>
	);
};
