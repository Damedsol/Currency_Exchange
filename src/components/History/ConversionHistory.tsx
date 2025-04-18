import {
	Button,
	makeStyles,
	shorthands,
	tokens,
	Text,
	TableBody,
	TableCell,
	TableRow,
	TableHeader,
	TableHeaderCell,
	Table,
	TableCellLayout,
	Tooltip,
} from "@fluentui/react-components";
import { ArrowRepeatAllRegular } from "@fluentui/react-icons";
import { useState, useEffect } from "react";

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
	},
	currencyCell: {},
	numericCell: {},
	rateCell: {},
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
			backgroundColor: tokens.colorNeutralBackground1Selected,
		},
	},
	timestampCell: {
		minWidth: "160px",
		maxWidth: "200px",
	},
	tableLayoutFixed: {
		tableLayout: "fixed",
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
		<div>
			<div
				className={`${styles.tableWrapper} ${isVisible ? styles.tableWrapperVisible : ""}`}
			>
				<Table
					className={styles.tableLayoutFixed}
					arial-label="Conversion History Table"
					size="medium"
				>
					<TableHeader>
						<TableRow>
							<TableHeaderCell style={{ textAlign: "center" }}>
								Amount
							</TableHeaderCell>
							<TableHeaderCell style={{ textAlign: "center" }}>
								From
							</TableHeaderCell>
							<TableHeaderCell style={{ textAlign: "center" }}>
								To
							</TableHeaderCell>
							<TableHeaderCell style={{ textAlign: "center" }}>
								Result
							</TableHeaderCell>
							<TableHeaderCell style={{ textAlign: "center" }}>
								Rate
							</TableHeaderCell>
							<TableHeaderCell style={{ textAlign: "center" }}>
								Timestamp
							</TableHeaderCell>
							<TableHeaderCell style={{ width: "60px", textAlign: "center" }}>
								Action
							</TableHeaderCell>
						</TableRow>
					</TableHeader>
					<TableBody>
						{history.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7}>
									{" "}
									{/* Span across all 7 columns now */}
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
							history.map((entry) => (
								<TableRow key={entry.timestamp} className={styles.tableRow}>
									<TableCell style={{ textAlign: "left" }}>
										<Tooltip
											content={formatNumber(entry.amount, 3, 3)}
											relationship="label"
										>
											<TableCellLayout truncate>
												{formatNumber(entry.amount, 3, 3)}
											</TableCellLayout>
										</Tooltip>
									</TableCell>
									<TableCell style={{ textAlign: "left" }}>
										<Tooltip content={entry.fromCurrency} relationship="label">
											<TableCellLayout truncate>
												{entry.fromCurrency}
											</TableCellLayout>
										</Tooltip>
									</TableCell>
									<TableCell style={{ textAlign: "left" }}>
										<Tooltip content={entry.toCurrency} relationship="label">
											<TableCellLayout truncate>
												{entry.toCurrency}
											</TableCellLayout>
										</Tooltip>
									</TableCell>
									<TableCell style={{ textAlign: "right" }}>
										<Tooltip
											content={formatNumber(entry.result, 3, 3)}
											relationship="label"
										>
											<TableCellLayout truncate>
												{formatNumber(entry.result, 3, 3)}
											</TableCellLayout>
										</Tooltip>
									</TableCell>
									<TableCell style={{ textAlign: "right" }}>
										<Tooltip
											content={formatNumber(entry.rate, 3, 3)}
											relationship="label"
										>
											<TableCellLayout truncate>
												<Text size={300} italic weight="regular">
													{formatNumber(entry.rate, 3, 3)}
												</Text>
											</TableCellLayout>
										</Tooltip>
									</TableCell>
									<TableCell style={{ textAlign: "left" }}>
										<Tooltip
											content={new Date(entry.timestamp).toLocaleString()}
											relationship="label"
										>
											<TableCellLayout truncate>
												{new Date(entry.timestamp).toLocaleString()}
											</TableCellLayout>
										</Tooltip>
									</TableCell>
									<TableCell style={{ width: "60px", textAlign: "center" }}>
										<TableCellLayout>
											<Tooltip content="Repeat conversion" relationship="label">
												<Button
													appearance="subtle"
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
