import {
	Button,
	Input,
	makeStyles,
	mergeClasses,
	shorthands,
	Text,
	Tooltip,
	tokens,
} from "@fluentui/react-components";
import {
	ArrowClockwiseRegular,
	CheckmarkCircleRegular,
	ErrorCircleRegular,
	KeyRegular,
	WarningRegular,
} from "@fluentui/react-icons";
import React from "react";

import { ThemeSwitcher } from "../ThemeSwitcher/ThemeSwitcher";

type ApiKeySaveStatus =
	| "idle"
	| "validating"
	| "saving"
	| "saved"
	| "invalid"
	| "error";

// Styles specific to the header, adapted from App.tsx
const useStyles = makeStyles({
	headerContainer: {
		display: "flex",
		justifyContent: "flex-end",
		alignItems: "center",
		marginBottom: tokens.spacingVerticalM,
		...shorthands.gap(tokens.spacingHorizontalS),
	},
	headerInputWrapper: {
		transitionProperty: "max-width, opacity",
		transitionDuration: "0.3s",
		transitionTimingFunction: "ease-out",
		overflow: "hidden",
		maxWidth: 0,
		opacity: 0,
		display: "flex",
		alignItems: "center",
		...shorthands.gap(tokens.spacingHorizontalXS),
	},
	headerInputWrapperVisible: {
		maxWidth: "250px",
		opacity: 1,
	},
	headerActionButton: {
		color: tokens.colorNeutralForeground3,
		":hover": {
			color: tokens.colorBrandForeground1,
			backgroundColor: tokens.colorSubtleBackgroundHover,
		},
		":focus": {
			color: tokens.colorBrandForeground1,
		},
	},
	apiKeyStoredIcon: {
		color: tokens.colorStatusSuccessForeground1,
	},
	apiKeyMissingIcon: {
		color: tokens.colorStatusDangerForeground1,
	},
	apiKeySavedIcon: {
		color: tokens.colorStatusSuccessForeground1,
	},
	apiKeyInvalidIcon: {
		color: tokens.colorStatusWarningForeground1,
	},
	apiKeyErrorIcon: {
		color: tokens.colorStatusDangerForeground1,
	},
	apiKeySavingIcon: {
		// Style if needed
	},
	currencyUpdateRow: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		...shorthands.gap(tokens.spacingHorizontalXS),
		fontSize: tokens.fontSizeBase200,
	},
	updateButton: {
		minWidth: "unset",
		minHeight: "unset",
		fontSize: tokens.fontSizeBase200,
	},
	errorText: {
		color: tokens.colorPaletteRedForeground1,
		fontSize: tokens.fontSizeBase200,
	},
	statusText: {
		fontSize: tokens.fontSizeBase200,
	},
});

interface AppHeaderProps {
	isDarkMode: boolean;
	toggleTheme: () => void;
	storedApiKey: string | null;
	isApiKeyHeaderInputVisible: boolean;
	apiKeyInput: string;
	apiKeySaveStatus: ApiKeySaveStatus;
	handleApiKeyChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	handleApiKeyInputBlur: () => void;
	toggleApiKeyHeaderInput: () => void;
	isCurrenciesLoaded?: boolean;
	isUpdatingCurrencies?: boolean;
	currenciesUpdateError?: string | null;
	onUpdateCurrencies?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
	isDarkMode,
	toggleTheme,
	storedApiKey,
	isApiKeyHeaderInputVisible,
	apiKeyInput,
	apiKeySaveStatus,
	handleApiKeyChange,
	handleApiKeyInputBlur,
	toggleApiKeyHeaderInput,
	isCurrenciesLoaded = false,
	isUpdatingCurrencies = false,
	currenciesUpdateError = null,
	onUpdateCurrencies = () => {},
}) => {
	const styles = useStyles();

	// Function to render the status icon and tooltip (copied from App.tsx)
	const renderApiKeyStatusIcon = (): React.ReactNode => {
		const iconStyle = { fontSize: tokens.fontSizeBase400 };
		switch (apiKeySaveStatus) {
			case "saving":
				return (
					<Tooltip content="Saving API Key..." relationship="label">
						<ArrowClockwiseRegular
							aria-hidden={true}
							className={styles.apiKeySavingIcon}
							style={iconStyle}
						/>
					</Tooltip>
				);
			case "saved":
				return (
					<Tooltip content="API Key Saved" relationship="label">
						<CheckmarkCircleRegular
							aria-hidden={true}
							className={styles.apiKeySavedIcon}
							style={iconStyle}
						/>
					</Tooltip>
				);
			case "invalid":
				return (
					<Tooltip content="Invalid API Key Format" relationship="label">
						<WarningRegular
							aria-hidden={true}
							className={styles.apiKeyInvalidIcon}
							style={iconStyle}
						/>
					</Tooltip>
				);
			case "error":
				return (
					<Tooltip content="Error Saving API Key" relationship="label">
						<ErrorCircleRegular
							aria-hidden={true}
							className={styles.apiKeyErrorIcon}
							style={iconStyle}
						/>
					</Tooltip>
				);
			case "validating":
			case "idle":
			default:
				return null;
		}
	};

	// Render currency update status row (only when API key is present)
	const renderCurrencyUpdate = (): React.ReactNode | null => {
		if (!storedApiKey) return null;

		return (
			<div className={styles.currencyUpdateRow}>
				{isUpdatingCurrencies ? (
					<Text size={200} className={styles.statusText}>
						Updating currencies...
					</Text>
				) : currenciesUpdateError ? (
					<Text size={200} className={styles.errorText}>
						{currenciesUpdateError}
					</Text>
				) : isCurrenciesLoaded ? (
					<Text size={200} className={styles.statusText}>
						Currency data loaded
					</Text>
				) : (
					<Text size={200} className={styles.statusText}>
						Load currencies to select them
					</Text>
				)}
				<Button
					appearance="subtle"
					size="small"
					icon={<ArrowClockwiseRegular />}
					className={styles.updateButton}
					onClick={onUpdateCurrencies}
					disabled={isUpdatingCurrencies}
					aria-label="Update currencies from API"
				>
					Update
				</Button>
			</div>
		);
	};

	return (
		<header className={styles.headerContainer}>
			<div
				className={mergeClasses(
					styles.headerInputWrapper,
					isApiKeyHeaderInputVisible && styles.headerInputWrapperVisible,
				)}
			>
				{isApiKeyHeaderInputVisible && (
					<>
						<Input
							aria-label="API Key Header Input"
							type="password"
							placeholder="Enter API Key..."
							size="small"
							appearance="outline"
							autoComplete="new-password"
							style={{
								width: "200px",
							}}
							value={apiKeyInput}
							onChange={handleApiKeyChange}
							onBlur={handleApiKeyInputBlur}
							autoFocus
						/>
						{renderApiKeyStatusIcon()}
					</>
				)}
			</div>
			<Tooltip
				content={
					storedApiKey ? "API Key is set" : "API Key missing - Click to set"
				}
				relationship="label"
			>
				<Button
					appearance="subtle"
					icon={<KeyRegular />}
					className={mergeClasses(
						styles.headerActionButton,
						storedApiKey ? styles.apiKeyStoredIcon : styles.apiKeyMissingIcon,
					)}
					onClick={toggleApiKeyHeaderInput}
					aria-label={
						isApiKeyHeaderInputVisible
							? "Hide API Key Input"
							: "Show API Key Input"
					}
					aria-expanded={isApiKeyHeaderInputVisible}
				/>
			</Tooltip>
			{renderCurrencyUpdate()}
			<ThemeSwitcher isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
		</header>
	);
};
