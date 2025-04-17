import React from 'react';
import {
	DeleteFilled,
	MoneyCalculatorFilled,
	SaveFilled,
	ArrowSyncRegular,
	HistoryDismissRegular,
} from '@fluentui/react-icons';
import { Button, makeStyles, shorthands, tokens } from '@fluentui/react-components';

// Styles for the button container
const useStyles = makeStyles({
	container: {
		display: "flex",
		flexWrap: "wrap", // Allow buttons to wrap
		...shorthands.gap(tokens.spacingHorizontalM),
		marginTop: tokens.spacingVerticalM,
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
	onSaveKey: () => void;
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
	onSaveKey,
	onRefreshRates,
	onClearHistory,
	onClearAll,
}) => {
	const styles = useStyles();

	return (
		<div className={styles.container}>
			<Button
				appearance="primary"
				icon={<MoneyCalculatorFilled />}
				onClick={onCalculate}
				disabled={!storedApiKey || amount <= 0 || rateSource === "loading"}
			>
				{rateSource === "loading" ? "Calculating..." : "Calculate"}
			</Button>

			<Button
				appearance="primary"
				icon={<SaveFilled />}
				onClick={onSaveKey}
				disabled={
					!isApiKeyValid ||
					apiKeyInput === "" ||
					apiKeyInput === storedApiKey
				}
			>
				Save Key
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

			<Button
				appearance="secondary"
				icon={<HistoryDismissRegular />}
				onClick={onClearHistory}
				disabled={isHistoryEmpty}
				title="Clear conversion history"
			>
				Clear History
			</Button>

			<Button
				appearance="outline"
				icon={<DeleteFilled />}
				onClick={onClearAll}
				title="Clear all stored data (API Key and History)"
			>
				Clear all data
			</Button>
		</div>
	);
}; 