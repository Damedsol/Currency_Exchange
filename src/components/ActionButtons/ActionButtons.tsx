import React from 'react';
import {
	DeleteFilled,
	MoneyCalculatorFilled,
	SaveFilled,
	ArrowSyncRegular,
	HistoryDismissRegular,
} from '@fluentui/react-icons';
import { Button, makeStyles, shorthands, tokens } from '@fluentui/react-components';

// Define breakpoints used in this component
const actionButtonBreakpoints = {
	mobile: 480, // Example breakpoint for stacking buttons
};

// Styles for the button container
const useStyles = makeStyles({
	container: {
		display: "flex",
		// flexWrap: "wrap", // Remove wrap if we want specific groups
		alignItems: "center", // Align items vertically
		...shorthands.gap(tokens.spacingHorizontalM),
		marginTop: tokens.spacingVerticalM,
		// Responsive stacking
		[`@media (max-width: ${actionButtonBreakpoints.mobile}px)`]: {
			flexDirection: "column",
			alignItems: "stretch", // Make button groups take full width
			...shorthands.gap(tokens.spacingVerticalM), // Vertical gap when stacked
		},
	},
	mainActions: {
		display: "flex",
		alignItems: "center",
		...shorthands.gap(tokens.spacingHorizontalM),
		// Responsive wrapping within the group might be needed too, or let them stack
		[`@media (max-width: ${actionButtonBreakpoints.mobile}px)`]: {
			flexWrap: "wrap", // Allow buttons within main actions to wrap if needed
			justifyContent: "center", // Center buttons when wrapped/stacked
		},
	},
	clearActions: {
		display: "flex",
		alignItems: "center",
		marginLeft: "auto", // Push this group to the right
		...shorthands.gap(tokens.spacingHorizontalS), // Smaller gap for clear buttons
		// Responsive alignment
		[`@media (max-width: ${actionButtonBreakpoints.mobile}px)`]: {
			marginLeft: 0, // Remove margin pushing it right
			justifyContent: "center", // Center buttons when stacked
			width: "100%", // Optional: make group take full width
		},
	},
	// Remove fixed width button style if present, let buttons size naturally
	// button: {
	//     minWidth: '120px',
	// }
});

// Define all required props
type RateSource = "idle" | "cache" | "api" | "error" | "loading";
interface ActionButtonsProps {
	// State for disabling buttons
	storedApiKey: string | null;
	amount: number;
	rateSource: RateSource;
	isApiKeyValid: boolean;
	apiKeyInput: string;
	isHistoryEmpty: boolean;
	// Action handlers
	onCalculate: () => void;
	onRefreshRates: () => void;
	onClearHistory: () => void;
	onClearAll: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
	storedApiKey,
	amount,
	rateSource,
	isApiKeyValid,
	apiKeyInput,
	isHistoryEmpty,
	onCalculate,
	onRefreshRates,
	onClearHistory,
	onClearAll,
}) => {
	const styles = useStyles();

	return (
		<div className={styles.container}>
			{/* Main Actions Group */}
			<div className={styles.mainActions}>
				<Button
					appearance="primary"
					icon={<MoneyCalculatorFilled />}
					onClick={onCalculate}
					disabled={!storedApiKey || amount <= 0 || rateSource === "loading"}
				>
					{rateSource === "loading" ? "Calculating..." : "Calculate"}
				</Button>

				<Button
					appearance="secondary"
					icon={<ArrowSyncRegular />}
					onClick={onRefreshRates}
					disabled={rateSource === "loading"}
					title="Clear cached rates and fetch live data"
				>
					Refresh Rates
				</Button>
			</div>

			{/* Clear Actions Group (pushed to the right) */}
			<div className={styles.clearActions}>
				<Button
					appearance="outline" // Changed from subtle back to a visible button style
					icon={<HistoryDismissRegular />}
					onClick={onClearHistory}
					disabled={isHistoryEmpty}
					title="Clear conversion history"
				>
					Clear History
				</Button>

				<Button
					appearance="outline" // Changed from subtle back to a visible button style
					icon={<DeleteFilled />}
					onClick={onClearAll}
					title="Clear all stored data (API Key and History)"
				>
					Clear all data
				</Button>
			</div>
		</div>
	);
}; 