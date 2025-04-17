import type { ConversionHistoryEntry } from "../../services/LocalStorage";
// Import necessary Fluent components and hooks
import {
	Button,
	makeStyles,
	shorthands,
	tokens,
	Text,
} from "@fluentui/react-components";

interface ConversionHistoryProps {
	history: ConversionHistoryEntry[];
	onRepeat: (entry: ConversionHistoryEntry) => void;
}

// Define styles using makeStyles
const useStyles = makeStyles({
	container: {
		// marginTop handled by historySection style in App.tsx
		// borderTop handled by Divider component now
		// paddingTop handled by spacing below Divider/Title
	},
	list: {
		listStyleType: "none",
		...shorthands.padding(0),
		marginTop: tokens.spacingVerticalM, // Add space below title
	},
	listItem: {
		marginBottom: tokens.spacingVerticalXS,
	},
	repeatButton: {
		width: "100%",
		justifyContent: "flex-start",
		height: 'auto', // Let button height adjust to content
		paddingTop: tokens.spacingVerticalS,
		paddingBottom: tokens.spacingVerticalS,
	},
	rateText: {
		// Use Text props like size=200, italic=true, weight="light"
		// Or define specific styles here if needed
		color: tokens.colorNeutralForeground3, // Use a subtle text color token
		marginLeft: tokens.spacingHorizontalM,
	},
});

export const ConversionHistory = ({
	history,
	onRepeat,
}: ConversionHistoryProps) => {
	const styles = useStyles();

	// Note: Title and Divider are now rendered in App.tsx
	// If this component needs to be self-contained, uncomment Divider/Text here
	// and remove them from App.tsx's historySection.

	if (history.length === 0) {
		return null; // Don't render anything if history is empty
	}

	return (
		<div className={styles.container}>
			{/* Optional: Title could be moved back here if needed */}
			{/* <Divider /> */}
			{/* <Text weight="semibold" as="h3" block style={{ marginTop: tokens.spacingVerticalL }}> */}
			{/*    <HistoryRegular style={{ marginRight: tokens.spacingHorizontalS }} /> */}
			{/*    Conversion History (Last 10) */}
			{/* </Text> */}

			<ul className={styles.list}>
				{history.map((entry) => (
					<li key={entry.timestamp} className={styles.listItem}>
						<Button
							className={styles.repeatButton}
							appearance="subtle"
							onClick={() => onRepeat(entry)}
							title={`Repeat: ${entry.amount} ${entry.fromCurrency} to ${entry.toCurrency}`}
						>
							{/* Main conversion text */}
							<Text>
								{entry.amount} {entry.fromCurrency} → {entry.result.toFixed(2)}{" "}
								{entry.toCurrency}
							</Text>
							{/* Rate text using Text component */}
							<Text size={200} className={styles.rateText}>
								(Rate: {entry.rate.toFixed(4)})
							</Text>
						</Button>
					</li>
				))}
			</ul>
		</div>
	);
};
