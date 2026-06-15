import {
	Button,
	makeStyles,
	shorthands,
	Table,
	TableBody,
	TableCell,
	TableCellLayout,
	TableHeader,
	TableHeaderCell,
	TableRow,
	Tooltip,
	tokens,
} from "@fluentui/react-components";
import { ArrowRepeatAllRegular } from "@fluentui/react-icons";
import { useDeferredValue, useEffect, useState } from "react";

import type { ConversionHistoryEntry } from "../../services/LocalStorage";

interface ConversionHistoryProps {
	history: ConversionHistoryEntry[];
	onRepeat: (entry: ConversionHistoryEntry) => void;
}

// Define styles using makeStyles
const useStyles = makeStyles({
	container: {},
	list: {
		listStyleType: "none",
		...shorthands.padding(0),
		marginTop: tokens.spacingVerticalM,
	},
	listItem: {
		marginBottom: tokens.spacingVerticalXS,
	},
	repeatButton: {
		width: "100%",
		justifyContent: "flex-start",
		height: "auto",
		paddingTop: tokens.spacingVerticalS,
		paddingBottom: tokens.spacingVerticalS,
	},
	rateText: {
		color: tokens.colorNeutralForeground3,
		marginLeft: tokens.spacingHorizontalM,
	},
	actionCell: {
		textAlign: "center",
		width: "60px",
	},
	currencyCell: {
		textAlign: "center",
	},
	numericCell: {
		textAlign: "right",
		fontFamily: tokens.fontFamilyMonospace,
	},
	rateCell: {
		textAlign: "right",
		fontFamily: tokens.fontFamilyMonospace,
	},
	tableWrapper: {
		opacity: 0,
		transition: "opacity 0.5s ease-in-out",
	},
	tableWrapperVisible: {
		opacity: 1,
	},
	tableRow: {
		"&:hover": {
			backgroundColor: tokens.colorNeutralBackground1Hover,
		},
		"&:nth-child(odd)": {
			backgroundColor: tokens.colorNeutralBackground4,
		},
	},
	timestampCell: {
		minWidth: "160px",
		maxWidth: "200px",
		textAlign: "center",
	},
	tableLayoutFixed: {
		tableLayout: "fixed",
		width: "100%",
	},
	headerCell: {
		textAlign: "center",
		fontWeight: "600",
		backgroundColor: tokens.colorBrandBackground,
		color: tokens.colorNeutralForegroundOnBrand,
	},
	amountCell: {
		textAlign: "right",
		fontFamily: tokens.fontFamilyMonospace,
	},
});

// Helper to format numbers clearly
const formatNumber = (
	num: number,
	minDecimals: number,
	maxDecimals: number,
): string => {
	return num.toLocaleString(undefined, {
		minimumFractionDigits: minDecimals,
		maximumFractionDigits: maxDecimals,
		useGrouping: false, // Disable thousands separators
	});
};

// Helper to format timestamp for better readability
const formatTimestamp = (
	timestamp: number | string | undefined | null,
): string => {
	// Check if timestamp is valid before creating Date object
	if (!timestamp) {
		return "Invalid date";
	}
	const date = new Date(timestamp);
	// Check if the created date is valid
	if (isNaN(date.getTime())) {
		return "Invalid date";
	}
	return date.toLocaleString(undefined, {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
};

// Helper to format timestamp showing only the date part
const formatShortDate = (
	timestamp: number | string | undefined | null,
): string => {
	// Check if timestamp is valid before creating Date object
	if (!timestamp) {
		return "Invalid date";
	}
	const date = new Date(timestamp);
	// Check if the created date is valid
	if (isNaN(date.getTime())) {
		return "Invalid date";
	}
	return date.toLocaleString(undefined, {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
};

export const ConversionHistory = ({
	history,
	onRepeat,
}: ConversionHistoryProps): React.JSX.Element => {
	const styles = useStyles();
	const deferredHistory = useDeferredValue(history);
	const isStale = history !== deferredHistory;
	// State for visibility transition
	const [isVisible, setIsVisible] = useState(false);

	// Trigger fade-in after mount
	useEffect(() => {
		// Use a small timeout to ensure the transition occurs after initial render
		const timer = setTimeout(() => {
			setIsVisible(true);
		}, 50); // Short delay
		return () => clearTimeout(timer);
	}, []);

	return (
		<div role="region" aria-label="Conversion History">
			<div
				className={`${styles.tableWrapper} ${isVisible ? styles.tableWrapperVisible : ""}`}
			>
				<Table
					className={styles.tableLayoutFixed}
					aria-label="Conversion History Table"
					size="medium"
					style={{ opacity: isStale ? 0.6 : 1 }}
				>
					<TableHeader>
						<TableRow>
							<TableHeaderCell className={styles.headerCell} scope="col">
								Amount
							</TableHeaderCell>
							<TableHeaderCell className={styles.headerCell} scope="col">
								From
							</TableHeaderCell>
							<TableHeaderCell className={styles.headerCell} scope="col">
								To
							</TableHeaderCell>
							<TableHeaderCell className={styles.headerCell} scope="col">
								Result
							</TableHeaderCell>
							<TableHeaderCell className={styles.headerCell} scope="col">
								Rate
							</TableHeaderCell>
							<TableHeaderCell className={styles.headerCell} scope="col">
								Timestamp
							</TableHeaderCell>
							<TableHeaderCell
								className={styles.headerCell}
								style={{ width: "60px" }}
								scope="col"
							>
								Action
							</TableHeaderCell>
						</TableRow>
					</TableHeader>
					<TableBody>
						{deferredHistory.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7}>
									<TableCellLayout
										style={{
											textAlign: "center",
											padding: tokens.spacingVerticalL,
										}}
									>
										No conversion history yet.
									</TableCellLayout>
								</TableCell>
							</TableRow>
						) : (
							deferredHistory.map((entry) => (
								<TableRow key={entry.timestamp} className={styles.tableRow}>
									<TableCell className={styles.amountCell}>
										<Tooltip
											content={formatNumber(entry.amount, 3, 3)}
											relationship="label"
										>
											<TableCellLayout truncate>
												{formatNumber(entry.amount, 3, 3)}
											</TableCellLayout>
										</Tooltip>
									</TableCell>
									<TableCell className={styles.currencyCell}>
										<Tooltip content={entry.fromCurrency} relationship="label">
											<TableCellLayout truncate>
												{entry.fromCurrency}
											</TableCellLayout>
										</Tooltip>
									</TableCell>
									<TableCell className={styles.currencyCell}>
										<Tooltip content={entry.toCurrency} relationship="label">
											<TableCellLayout truncate>
												{entry.toCurrency}
											</TableCellLayout>
										</Tooltip>
									</TableCell>
									<TableCell className={styles.numericCell}>
										<Tooltip
											content={formatNumber(entry.result, 3, 3)}
											relationship="label"
										>
											<TableCellLayout truncate>
												{formatNumber(entry.result, 3, 3)}
											</TableCellLayout>
										</Tooltip>
									</TableCell>
									<TableCell className={styles.rateCell}>
										<Tooltip
											content={formatNumber(entry.rate, 3, 3)}
											relationship="label"
										>
											<TableCellLayout truncate>
												{formatNumber(entry.rate, 3, 3)}
											</TableCellLayout>
										</Tooltip>
									</TableCell>
									<TableCell className={styles.timestampCell}>
										<Tooltip
											content={formatTimestamp(entry.timestamp)}
											relationship="label"
										>
											<TableCellLayout truncate>
												{formatShortDate(entry.timestamp)}
											</TableCellLayout>
										</Tooltip>
									</TableCell>
									<TableCell className={styles.actionCell}>
										<Tooltip
											content="Repeat this conversion"
											relationship="label"
										>
											<Button
												appearance="subtle"
												icon={<ArrowRepeatAllRegular />}
												aria-label="Repeat conversion"
												onClick={() => onRepeat(entry)}
											/>
										</Tooltip>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
};
