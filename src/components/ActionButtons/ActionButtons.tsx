import {
	Button,
	makeStyles,
	shorthands,
	tokens,
	Dialog,
	DialogTrigger,
	DialogSurface,
	DialogBody,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@fluentui/react-components";
import { DeleteRegular, WarningRegular } from "@fluentui/react-icons";
import React, { useState } from "react";

const useStyles = makeStyles({
	container: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		...shorthands.gap(tokens.spacingHorizontalM),
		marginTop: tokens.spacingVerticalM,
	},
	clearButton: {
		backgroundColor: tokens.colorNeutralBackground1,
		color: tokens.colorPaletteRedForeground1,
		...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalL),
		...shorthands.borderRadius(tokens.borderRadiusMedium),
		fontWeight: tokens.fontWeightSemibold,
		...shorthands.border(
			tokens.strokeWidthThin,
			"solid",
			tokens.colorPaletteRedBorder1,
		),
		":hover": {
			backgroundColor: tokens.colorNeutralBackground1Hover,
			color: tokens.colorPaletteRedForeground1,
			...shorthands.border(
				tokens.strokeWidthThin,
				"solid",
				tokens.colorPaletteRedBorderActive,
			),
		},
		":active": {
			backgroundColor: tokens.colorNeutralBackground1Pressed,
			color: tokens.colorPaletteRedForeground1,
		},
		":focus-visible": {
			outlineColor: tokens.colorPaletteRedBorder1,
		},
	},
	dialogTitle: {
		display: "flex",
		alignItems: "center",
		...shorthands.gap(tokens.spacingHorizontalS),
	},
	warningIcon: {
		color: tokens.colorPaletteYellowForeground1,
		fontSize: tokens.fontSizeBase500,
	},
	confirmButton: {
		backgroundColor: tokens.colorPaletteRedBackground1,
		color: tokens.colorNeutralForegroundOnBrand,
		":hover": {
			backgroundColor: tokens.colorPaletteRedBackground2,
		},
		":active": {
			backgroundColor: tokens.colorPaletteRedBorderActive,
		},
	},
});

type RateSource = "idle" | "cache" | "api" | "error" | "loading";
interface ActionButtonsProps {
	storedApiKey: string | null;
	amount: number;
	rateSource: RateSource;
	isApiKeyValid: boolean;
	apiKeyInput: string;
	isHistoryEmpty: boolean;
	onClearHistory: () => void;
	onClearAll: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onClearAll }) => {
	const styles = useStyles();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleConfirmClear: () => void = () => {
		onClearAll();
		setIsDialogOpen(false);
	};

	return (
		<div className={styles.container}>
			<Dialog
				open={isDialogOpen}
				onOpenChange={(_event, data) => setIsDialogOpen(data.open)}
			>
				<DialogTrigger disableButtonEnhancement>
					<Button
						appearance="outline"
						icon={<DeleteRegular />}
						title="Clear all stored data (API Key and History)"
						className={styles.clearButton}
					>
						Clear all data
					</Button>
				</DialogTrigger>
				<DialogSurface>
					<DialogBody>
						<DialogTitle className={styles.dialogTitle}>
							<WarningRegular className={styles.warningIcon} />
							Confirmar eliminación
						</DialogTitle>
						<DialogContent>
							¿Estás seguro de que deseas eliminar todos los datos almacenados?
							Esta acción eliminará tu clave API y todo el historial de
							conversiones. Esta acción no se puede deshacer.
						</DialogContent>
						<DialogActions>
							<Button
								appearance="subtle"
								onClick={() => setIsDialogOpen(false)}
							>
								Cancelar
							</Button>
							<Button
								appearance="primary"
								onClick={handleConfirmClear}
								className={styles.confirmButton}
							>
								Eliminar datos
							</Button>
						</DialogActions>
					</DialogBody>
				</DialogSurface>
			</Dialog>
		</div>
	);
};
