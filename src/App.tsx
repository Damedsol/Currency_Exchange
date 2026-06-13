import {
	Card,
	makeStyles,
	shorthands,
	tokens,
} from "@fluentui/react-components";
import React, { lazy, Suspense, useCallback, useMemo } from "react";

import { AppHeader } from "./components/AppHeader/AppHeader";
import { AppMessageBar } from "./components/AppMessageBar/AppMessageBar";
import { ConversionControls } from "./components/ConversionControls/ConversionControls";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";

const HistoryPanel = lazy(() =>
	import("./components/HistoryPanel/HistoryPanel").then((m) => ({
		default: m.HistoryPanel,
	})),
);

import { useApiKey } from "./hooks/useApiKey";
import { useAppMessage } from "./hooks/useAppMessage";
import { useConversion } from "./hooks/useConversion";
import {
	loadInitialHistory,
	useConversionHistory,
} from "./hooks/useConversionHistory";
import { clearLocalStorage, clearRatesCache } from "./services/LocalStorage";

const breakpoints = {
	small: 320,
	medium: 600,
	tablet: 768,
	large: 1024,
};

const useStyles = makeStyles({
	appContainer: {
		maxWidth: "1250px",
		margin: `${tokens.spacingVerticalXXL} auto`,
		paddingLeft: tokens.spacingHorizontalL,
		paddingRight: tokens.spacingHorizontalL,
		[`@media (max-width: ${breakpoints.medium}px)`]: {
			paddingLeft: tokens.spacingHorizontalM,
			paddingRight: tokens.spacingHorizontalM,
		},
	},
	root: {
		display: "flex",
		flexDirection: "column",
		...shorthands.gap(tokens.spacingVerticalL),
		paddingTop: "20px",
		paddingBottom: tokens.spacingVerticalXXL,
		paddingLeft: tokens.spacingHorizontalXL,
		paddingRight: tokens.spacingHorizontalXL,
		backgroundColor: tokens.colorNeutralBackground2,
	},
	mainContent: {
		display: "flex",
		flexDirection: "row",
		...shorthands.gap(tokens.spacingHorizontalXXL),
		[`@media (max-width: ${breakpoints.tablet}px)`]: {
			flexDirection: "column",
			...shorthands.gap(tokens.spacingVerticalXL),
		},
	},
});

interface AppProps {
	toggleTheme: () => void;
	isDarkMode: boolean;
}

function App({ toggleTheme, isDarkMode }: AppProps): React.JSX.Element {
	const styles = useStyles();

	const { appMessage, showAppMessage, dismissMessage } = useAppMessage();
	const apiKey = useApiKey();
	const initHistory = useMemo(() => loadInitialHistory(), []);
	const history = useConversionHistory(initHistory);

	const showError = useCallback(
		(message: string) => showAppMessage(message, "error"),
		[showAppMessage],
	);

	const conversion = useConversion({
		storedApiKey: apiKey.storedApiKey,
		onConversionComplete: history.addEntry,
		showError,
	});

	const handleClearApiAndCache = useCallback(() => {
		dismissMessage();
		clearLocalStorage();
		apiKey.clearApiKey();
		history.clearConversionHistory();
		showAppMessage("All data cleared.", "warning");
	}, [dismissMessage, apiKey, history, showAppMessage]);

	const handleClearCacheAndFetch = useCallback(() => {
		dismissMessage();
		clearRatesCache();
		showAppMessage("Rates cache cleared.", "info");
		if (
			apiKey.storedApiKey &&
			conversion.amount > 0 &&
			conversion.fromCurrency !== conversion.toCurrency
		) {
			void conversion.fetchRate();
		}
	}, [dismissMessage, apiKey.storedApiKey, conversion, showAppMessage]);

	return (
		<div className={styles.appContainer}>
			<Card className={styles.root}>
				<AppHeader
					isDarkMode={isDarkMode}
					toggleTheme={toggleTheme}
					storedApiKey={apiKey.storedApiKey}
					isApiKeyHeaderInputVisible={apiKey.isApiKeyHeaderInputVisible}
					apiKeyInput={apiKey.apiKeyInput}
					apiKeySaveStatus={apiKey.apiKeySaveStatus}
					handleApiKeyChange={apiKey.handleApiKeyChange}
					handleApiKeyInputBlur={apiKey.handleApiKeyInputBlur}
					toggleApiKeyHeaderInput={apiKey.toggleApiKeyHeaderInput}
				/>

				<AppMessageBar
					appMessage={appMessage}
					dismissMessage={dismissMessage}
				/>

				<main className={styles.mainContent}>
					<ConversionControls
						fromCurrency={conversion.fromCurrency}
						toCurrency={conversion.toCurrency}
						amount={conversion.amount}
						rate={conversion.rate}
						rateSource={conversion.rateSource}
						storedApiKey={apiKey.storedApiKey}
						isApiKeyValid={apiKey.isApiKeyValid}
						apiKeyInput={apiKey.apiKeyInput}
						conversionHistory={history.conversionHistory}
						handleFromCurrency={conversion.handleFromCurrency}
						handleToCurrency={conversion.handleToCurrency}
						swapCurrencies={conversion.swapCurrencies}
						handleAmountChange={conversion.handleAmountChange}
						handleClearCacheAndFetch={handleClearCacheAndFetch}
						fetchRate={conversion.fetchRate}
						clearConversionHistory={history.clearConversionHistory}
						clearApiAndCache={handleClearApiAndCache}
					/>
					<ErrorBoundary>
						<Suspense
							fallback={
								<div style={{ padding: "16px" }}>Loading history...</div>
							}
						>
							<HistoryPanel
								history={history.conversionHistory}
								onRepeatConversion={conversion.repeatConversion}
								clearConversionHistory={history.clearConversionHistory}
							/>
						</Suspense>
					</ErrorBoundary>
				</main>
			</Card>
		</div>
	);
}

export default App;
