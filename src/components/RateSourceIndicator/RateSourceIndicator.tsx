import {
	makeStyles,
	mergeClasses,
	Spinner,
	shorthands,
	Text,
	tokens,
} from "@fluentui/react-components";
import {
	ErrorCircleRegular,
	GlobeRegular,
	HistoryRegular,
} from "@fluentui/react-icons";
import React from "react";

// Specific styles for the indicator
const useStyles = makeStyles({
	text: {
		display: "inline-flex",
		alignItems: "center",
		fontFamily: tokens.fontFamilyBase,
		...shorthands.gap(tokens.spacingHorizontalXXS),
	},
	help: {
		cursor: "help",
	},
	error: {
		color: tokens.colorPaletteRedForeground1,
	},
	cacheIcon: {
		color: tokens.colorNeutralForeground3,
	},
	liveIcon: {
		color: tokens.colorBrandBackground,
	},
});

// Props
type RateSource = "idle" | "cache" | "api" | "error" | "loading";
interface RateSourceIndicatorProps {
	rateSource: RateSource;
}

export const RateSourceIndicator: React.FC<RateSourceIndicatorProps> =
	React.memo(({ rateSource }) => {
		const styles = useStyles();

		const textProps = {
			size: 200 as const,
			as: "span" as const,
		};

		if (rateSource === "loading") {
			return <Spinner size="tiny" label="Loading rate..." />;
		}
		if (rateSource === "cache") {
			return (
				<Text
					{...textProps}
					title="Data from cache (max 24h old)"
					className={mergeClasses(styles.text, styles.help)}
				>
					<HistoryRegular
						aria-hidden="true"
						className={styles.cacheIcon}
						style={{ verticalAlign: "middle" }}
					/>{" "}
					(cached)
				</Text>
			);
		}
		if (rateSource === "api") {
			return (
				<Text
					{...textProps}
					title="Live data from API"
					className={mergeClasses(styles.text, styles.help)}
				>
					<GlobeRegular
						aria-hidden="true"
						className={styles.liveIcon}
						style={{ verticalAlign: "middle" }}
					/>{" "}
					(live)
				</Text>
			);
		}
		if (rateSource === "error") {
			return (
				<Text
					{...textProps}
					className={mergeClasses(styles.text, styles.error)}
				>
					<ErrorCircleRegular
						aria-hidden="true"
						style={{ verticalAlign: "middle" }}
					/>{" "}
					Error fetching rate
				</Text>
			);
		}
		return null; // Render nothing if 'idle'
	});
