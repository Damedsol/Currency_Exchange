import {
	Text,
	makeStyles,
	shorthands,
	tokens,
} from "@fluentui/react-components";
import { ArrowSyncRegular } from "@fluentui/react-icons";
import React from "react";

// Specific styles for the indicator
const useStyles = makeStyles({
	text: {
		display: "inline-flex",
		alignItems: "center",
		...shorthands.gap(tokens.spacingHorizontalXXS),
	},
	help: {
		cursor: "help",
	},
	error: {
		color: tokens.colorPaletteRedForeground1,
	},
});

// Props
type RateSource = "idle" | "cache" | "api" | "error" | "loading";
interface RateSourceIndicatorProps {
	rateSource: RateSource;
}

export const RateSourceIndicator: React.FC<RateSourceIndicatorProps> = ({
	rateSource,
}) => {
	const styles = useStyles();

	// Common props for Text component
	const textProps = { size: 200, as: "span" as const, className: styles.text }; // Use size 200 for smaller text, use as="span" to avoid block layout

	if (rateSource === "loading") {
		return <Text {...textProps}>Loading...</Text>;
	}
	if (rateSource === "cache") {
		return (
			<Text
				{...textProps}
				title="Data from cache (max 24h old)"
				className={`${styles.text} ${styles.help}`}
			>
				<ArrowSyncRegular style={{ verticalAlign: "middle" }} /> (cached)
			</Text>
		);
	}
	if (rateSource === "api") {
		return (
			<Text
				{...textProps}
				title="Live data from API"
				className={`${styles.text} ${styles.help}`}
			>
				<ArrowSyncRegular style={{ verticalAlign: "middle" }} /> (live)
			</Text>
		);
	}
	if (rateSource === "error") {
		return (
			<Text {...textProps} className={`${styles.text} ${styles.error}`}>
				Error fetching rate
			</Text>
		);
	}
	return null; // Render nothing if 'idle'
};
