import {
	Button,
	makeStyles,
	shorthands,
	tokens,
} from "@fluentui/react-components";
import React from "react";

const useStyles = makeStyles({
	container: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		...shorthands.gap(tokens.spacingVerticalL),
		...shorthands.padding(tokens.spacingVerticalXXL, tokens.spacingHorizontalXL),
		...shorthands.border("2px", "dashed", tokens.colorNeutralStrokeAccessible),
		...shorthands.borderRadius(tokens.borderRadiusMedium),
		textAlign: "center",
	},
	message: {
		fontFamily: tokens.fontFamilyMonospace,
		fontSize: tokens.fontSizeBase300,
		color: tokens.colorNeutralForeground2,
		margin: 0,
	},
});

interface EmptyStateProps {
	message?: string;
	actionLabel?: string;
	onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
	message = "No data available.",
	actionLabel,
	onAction,
}) => {
	const styles = useStyles();

	return (
		<div className={styles.container} role="status">
			<p className={styles.message}>{message}</p>
			{actionLabel && onAction && (
				<Button appearance="primary" onClick={onAction}>
					{actionLabel}
				</Button>
			)}
		</div>
	);
};
