import {
	makeStyles,
	shorthands,
	tokens,
	Divider,
	Text,
	Button,
	Dialog,
	DialogTrigger,
	DialogSurface,
	DialogBody,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@fluentui/react-components";
import { HistoryDismissRegular, WarningRegular } from "@fluentui/react-icons";
import React, { useState } from "react";

import { ConversionHistory } from "../History/ConversionHistory";

import type { ConversionHistoryEntry } from "../../services/LocalStorage";

// Styles specific to the history panel, adapted from App.tsx
const useStyles = makeStyles({
	rightColumn: {
		display: "flex",
		flexDirection: "column",
		flexBasis: "70%", // Adjust based on desired layout
		...shorthands.gap(tokens.spacingVerticalL),
	},
	historySection: {},
	historyHeader: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: tokens.spacingVerticalS,
	},
	historyTitle: {
		margin: 0,
		padding: 0,
		display: "block",
	},
	clearHistoryButton: {
		marginLeft: tokens.spacingHorizontalS,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		...shorthands.gap(tokens.spacingHorizontalXS),
	},
	dismissButton: {
		// Copied from AppMessageBar for consistency if needed, or rely on default
	},
	destructiveActionButton: {
		backgroundColor: tokens.colorPaletteRedBackground1,
		color: tokens.colorNeutralForegroundOnBrand,
		":hover": {
			backgroundColor: tokens.colorPaletteRedBackground2,
		},
		":active": {
			backgroundColor: tokens.colorPaletteRedBackground2,
		},
	},
});

interface HistoryPanelProps {
	history: ConversionHistoryEntry[];
	onRepeatConversion: (entry: ConversionHistoryEntry) => void;
	clearConversionHistory: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
	history,
	onRepeatConversion,
	clearConversionHistory,
}) => {
	const styles = useStyles();
	const [isHistoryClearDialogOpen, setIsHistoryClearDialogOpen] =
		useState<boolean>(false);

	const handleConfirmClearHistory: () => void = () => {
		clearConversionHistory();
		setIsHistoryClearDialogOpen(false);
	};

	return (
		// Use <aside> as it contains complementary content (history)
		<aside aria-labelledby="history-heading" className={styles.rightColumn}>
			<div className={styles.historySection}>
				<div className={styles.historyHeader}>
					<Text
						id="history-heading"
						weight="semibold"
						as="h2"
						className={styles.historyTitle}
					>
						Conversion History (Last 10)
					</Text>
					<Dialog
						open={isHistoryClearDialogOpen}
						onOpenChange={(_event, data) =>
							setIsHistoryClearDialogOpen(data.open)
						}
					>
						<DialogTrigger disableButtonEnhancement>
							<Button
								appearance="outline"
								icon={<HistoryDismissRegular aria-hidden="true" />} // Hide icon
								disabled={history.length === 0}
								// Remove title attribute, button text is sufficient
								size="small"
								className={styles.clearHistoryButton}
							>
								Clear History
							</Button>
						</DialogTrigger>
						<DialogSurface>
							<DialogBody>
								<DialogTitle>
									<WarningRegular
										aria-hidden="true" // Hide decorative icon
										style={{
											color: tokens.colorPaletteYellowForeground1,
											fontSize: tokens.fontSizeBase500,
											marginRight: tokens.spacingHorizontalS,
										}}
									/>
									Confirmar eliminación del historial
								</DialogTitle>
								<DialogContent>
									¿Estás seguro de que deseas eliminar todo el historial de
									conversiones? Esta acción no se puede deshacer.
								</DialogContent>
								<DialogActions>
									<Button
										appearance="subtle"
										onClick={() => setIsHistoryClearDialogOpen(false)}
										className={styles.dismissButton}
									>
										Cancelar
									</Button>
									<Button
										appearance="primary"
										onClick={handleConfirmClearHistory}
										className={styles.destructiveActionButton}
									>
										Eliminar historial
									</Button>
								</DialogActions>
							</DialogBody>
						</DialogSurface>
					</Dialog>
				</div>
				<Divider />
				<ConversionHistory history={history} onRepeat={onRepeatConversion} />
			</div>
		</aside>
	);
};
