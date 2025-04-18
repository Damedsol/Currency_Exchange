import { useState, useEffect } from 'react';
import type { ConversionHistoryEntry } from "../../services/LocalStorage";
// Import necessary Fluent components and hooks
import {
	Button,
	makeStyles,
	shorthands,
	tokens,
	Text, // Re-import Text component
	TableBody,
	TableCell,
	TableRow,
	TableHeader,
	TableHeaderCell,
	Table,
	TableCellLayout,
	Tooltip
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
		textAlign: "center"
	},
	currencyCell: {
		// minWidth: "60px", // Removed width constraints
		// maxWidth: "90px",
	},
	numericCell: {
		// minWidth: "80px", // Removed width constraints
		// maxWidth: "160px",
		// textAlign: "right" as const, // Align numbers to the right - Applied via style prop
	},
	rateCell: {
		// minWidth: "100px", // Removed width constraints
		// maxWidth: "200px",
		// textAlign: "right" as const, - Applied via style prop
	},
	tableWrapper: {
		// overflowX: "auto", // Removed overflow to prevent scrollbar
		opacity: 0, // Start hidden
		transition: "opacity 0.5s ease-in-out", // Fade-in transition
	},
	tableWrapperVisible: {
		opacity: 1, // Visible state
	},
	tableRow: { // Base styles for table row
		"&:hover": {
			backgroundColor: tokens.colorNeutralBackground1Hover,
		},
		"&:nth-child(odd)": { // Apply style to odd rows for striping
			backgroundColor: tokens.colorNeutralBackground1Selected, // Or another subtle color
		}
	},
	timestampCell: { // Style for the timestamp column
		minWidth: "160px", // Allocate enough space for date and time
		maxWidth: "200px",
	},
	tableLayoutFixed: { // Style to enforce fixed table layout
		tableLayout: "fixed",
	},
});

// Helper to format numbers clearly
const formatNumber = (num: number, minDecimals: number, maxDecimals: number): string => {
	return num.toLocaleString(undefined, {
		minimumFractionDigits: minDecimals,
		maximumFractionDigits: maxDecimals,
		useGrouping: false // Disable thousands separators
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
				<Table className={styles.tableLayoutFixed} arial-label="Conversion History Table" size="medium">
					<TableHeader>
						<TableRow>
							<TableHeaderCell style={{ textAlign: 'center' }}>Amount</TableHeaderCell>
							<TableHeaderCell style={{ textAlign: 'center' }}>From</TableHeaderCell>
							<TableHeaderCell style={{ textAlign: 'center' }}>To</TableHeaderCell>
							<TableHeaderCell style={{ textAlign: 'center' }}>Result</TableHeaderCell>
							<TableHeaderCell style={{ textAlign: 'center' }}>Rate</TableHeaderCell>
							<TableHeaderCell style={{ textAlign: 'center' }}>Timestamp</TableHeaderCell>
							<TableHeaderCell style={{ width: '60px', textAlign: 'center' }}>Action</TableHeaderCell>

						</TableRow>
					</TableHeader>
					<TableBody>
						{history.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7}> {/* Span across all 7 columns now */}
									<TableCellLayout style={{ textAlign: 'center', padding: tokens.spacingVerticalL }}>
										No conversion history yet.
									</TableCellLayout>
								</TableCell>
							</TableRow>
						) : (
							history.map((entry) => (
								<TableRow key={entry.timestamp} className={styles.tableRow}>
									<TableCell style={{ textAlign: 'left' }}>
										<Tooltip content={formatNumber(entry.amount, 3, 3)} relationship="label">
											<TableCellLayout truncate>{formatNumber(entry.amount, 3, 3)}</TableCellLayout>
										</Tooltip>
									</TableCell>
									<TableCell style={{ textAlign: 'left' }}>
										<Tooltip content={entry.fromCurrency} relationship="label">
											<TableCellLayout truncate>{entry.fromCurrency}</TableCellLayout>
										</Tooltip>
									</TableCell>
									<TableCell style={{ textAlign: 'left' }}>
										<Tooltip content={entry.toCurrency} relationship="label">
											<TableCellLayout truncate>{entry.toCurrency}</TableCellLayout>
										</Tooltip>
									</TableCell>
									<TableCell style={{ textAlign: 'right' }}>
										<Tooltip content={formatNumber(entry.result, 3, 3)} relationship="label">
											<TableCellLayout truncate>{formatNumber(entry.result, 3, 3)}</TableCellLayout>
										</Tooltip>
									</TableCell>
									<TableCell style={{ textAlign: 'right' }}>
										<Tooltip content={formatNumber(entry.rate, 3, 3)} relationship="label">
											<TableCellLayout truncate>
												<Text size={300} italic weight="regular">
													{formatNumber(entry.rate, 3, 3)}
												</Text>
											</TableCellLayout>
										</Tooltip>
									</TableCell>
									<TableCell style={{ textAlign: 'left' }}>
										<Tooltip content={new Date(entry.timestamp).toLocaleString()} relationship="label">
											<TableCellLayout truncate>{new Date(entry.timestamp).toLocaleString()}</TableCellLayout>
										</Tooltip>
									</TableCell>
									<TableCell style={{ width: '60px', textAlign: 'center' }}>
										<TableCellLayout>
											<Tooltip content="Repeat conversion" relationship="label">
												<Button
													appearance="subtle" // Subtle appearance for icon-only
													icon={<ArrowRepeatAllRegular />}
													onClick={() => onRepeat(entry)}
													size="small"
												/>
											</Tooltip>
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
