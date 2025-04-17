import React, { useState, useEffect } from 'react';
import type { ConversionHistoryEntry } from "../../services/LocalStorage";
// Import necessary Fluent components and hooks
import {
	Button,
	makeStyles,
	shorthands,
	tokens,
	// Text, // Removed unused import
	TableBody,
	TableCell,
	TableRow,
	TableHeader,
	TableHeaderCell,
	Table,
	TableCellLayout
} from "@fluentui/react-components";
import { ArrowRepeatAllRegular } from "@fluentui/react-icons";

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
	tableContainer: {
		// No specific container styles needed for now
	},
	actionCell: {
		// Ensure button fits well
	},
	tableWrapper: {
		overflowX: "auto", // Enable horizontal scroll on overflow
		maxWidth: "100%", // Ensure wrapper doesn't exceed parent width
		opacity: 0, // Start hidden
		transition: "opacity 0.5s ease-in-out", // Fade-in transition
	},
	tableWrapperVisible: {
		opacity: 1, // Visible state
	},
});

// Helper to format numbers clearly
const formatNumber = (num: number, minDecimals: number, maxDecimals: number): string => {
	return num.toLocaleString(undefined, {
		minimumFractionDigits: minDecimals,
		maximumFractionDigits: maxDecimals,
	});
};

export const ConversionHistory = ({
	history,
	onRepeat,
}: ConversionHistoryProps) => {
	const styles = useStyles();
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
		<div className={styles.tableContainer}>
			<div className={`${styles.tableWrapper} ${isVisible ? styles.tableWrapperVisible : ''}`}>
				<Table arial-label="Conversion History Table" size="medium">
					<TableHeader>
						<TableRow>
							<TableHeaderCell>Amount</TableHeaderCell>
							<TableHeaderCell>From</TableHeaderCell>
							<TableHeaderCell>To</TableHeaderCell>
							<TableHeaderCell>Result</TableHeaderCell>
							<TableHeaderCell>Rate</TableHeaderCell>
							<TableHeaderCell>Action</TableHeaderCell>
						</TableRow>
					</TableHeader>
					<TableBody>
						{history.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6}> {/* Span across all 6 columns */}
									<TableCellLayout style={{ textAlign: 'center', padding: tokens.spacingVerticalL }}>
										No conversion history yet.
									</TableCellLayout>
								</TableCell>
							</TableRow>
						) : (
							history.map((entry) => (
								<TableRow key={entry.timestamp}>
									<TableCell>
										<TableCellLayout>{formatNumber(entry.amount, 0, 2)}</TableCellLayout>
									</TableCell>
									<TableCell>
										<TableCellLayout>{entry.fromCurrency}</TableCellLayout>
									</TableCell>
									<TableCell>
										<TableCellLayout>{entry.toCurrency}</TableCellLayout>
									</TableCell>
									<TableCell>
										<TableCellLayout>{formatNumber(entry.result, 2, 2)}</TableCellLayout>
									</TableCell>
									<TableCell>
										<TableCellLayout><i>{formatNumber(entry.rate, 4, 6)}</i></TableCellLayout>
									</TableCell>
									<TableCell className={styles.actionCell}>
										<TableCellLayout>
											<Button
												appearance="outline"
												icon={<ArrowRepeatAllRegular />}
												onClick={() => onRepeat(entry)}
												title={`Repeat: ${entry.amount} ${entry.fromCurrency} to ${entry.toCurrency}`}
												size="small"
											>
												Repeat
											</Button>
										</TableCellLayout>
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
