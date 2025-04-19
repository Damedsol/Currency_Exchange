import {
	Button,
	makeStyles,
	shorthands,
	tokens,
} from "@fluentui/react-components";
import {
	ArrowSyncRegular,
	HistoryDismissRegular,
} from "@fluentui/react-icons";
import React from "react";

const actionButtonBreakpoints = {
	mobile: 480,
};

const useStyles = makeStyles({
	container: {
		display: "flex",
		alignItems: "center",
		...shorthands.gap(tokens.spacingHorizontalM),
		marginTop: tokens.spacingVerticalM,
		[`@media (max-width: ${actionButtonBreakpoints.mobile}px)`]: {
			flexDirection: "column",
			alignItems: "stretch",
			...shorthands.gap(tokens.spacingVerticalM),
		},
	},
	mainActions: {
		display: "flex",
		alignItems: "center",
		...shorthands.gap(tokens.spacingHorizontalM),
		[`@media (max-width: ${actionButtonBreakpoints.mobile}px)`]: {
			flexWrap: "wrap",
			justifyContent: "center",
		},
	},
	clearActions: {
		display: "flex",
		alignItems: "center",
		marginLeft: "auto",
		...shorthands.gap(tokens.spacingHorizontalS),
		[`@media (max-width: ${actionButtonBreakpoints.mobile}px)`]: {
			marginLeft: 0,
			justifyContent: "center",
			width: "100%",
		},
	},
});

type RateSource = "idle" | "cache" | "api" | "error" | "loading";
interface ActionButtonsProps {
	storedApiKey: string | null;
	amount: number;
	rateSource: RateSource;
	isApiKeyValid: boolean;
	apiKeyInput: string;
	isHistoryEmpty: boolean;
	onRefreshRates: () => void;
	onClearHistory: () => void;
	onClearAll: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
	rateSource,
	isHistoryEmpty,
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
					appearance="secondary"
					icon={<ArrowSyncRegular />}
					onClick={onRefreshRates}
					disabled={rateSource === "loading"}
					title="Clear cached rates and fetch live data"
				>
					Refresh Rates
				</Button>
			</div>
			<div className={styles.clearActions}>
				<Button
					appearance="outline"
					icon={<HistoryDismissRegular />}
					onClick={onClearHistory}
					disabled={isHistoryEmpty}
					title="Clear conversion history"
				>
					Clear History
				</Button>

				<Button
					appearance="outline"
					onClick={onClearAll}
					title="Clear all stored data (API Key and History)"
				>
					Clear all data
				</Button>
			</div>
		</div>
	);
};
