import {
	Button,
	MessageBar,
	MessageBarBody,
	type MessageBarIntent,
	makeStyles,
	mergeClasses,
	tokens,
} from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";
import React from "react";
import type { AppMessage } from "../../types";

const useStyles = makeStyles({
	messageBarContainer: {
		transitionProperty: "max-height, opacity",
		transitionDuration: "0.3s",
		transitionTimingFunction: "ease-in-out",
		overflow: "hidden",
		maxHeight: 0,
		opacity: 0,
		boxShadow: "none",
	},
	messageBarContainerVisible: {
		maxHeight: "60px",
		opacity: 1,
		marginBottom: tokens.spacingVerticalM,
	},
	dismissButton: {
		color: tokens.colorNeutralForeground2,
		":hover": {
			color: tokens.colorNeutralForeground1,
			backgroundColor: tokens.colorSubtleBackgroundHover,
		},
	},
	successBorder: {
		borderLeft: `4px solid ${tokens.colorStatusSuccessForeground1}`,
	},
	errorBorder: {
		borderLeft: `4px solid ${tokens.colorStatusDangerForeground1}`,
	},
	warningBorder: {
		borderLeft: `4px solid ${tokens.colorStatusWarningForeground1}`,
	},
	infoBorder: {
		borderLeft: `4px solid ${tokens.colorNeutralStrokeAccessible}`,
	},
});

const prefixByIntent: Record<MessageBarIntent, string> = {
	success: "[OK] ",
	error: "[!] ",
	warning: "[?] ",
	info: "",
};

interface AppMessageBarProps {
	appMessage: AppMessage;
	dismissMessage: () => void;
}

export const AppMessageBar: React.FC<AppMessageBarProps> = ({
	appMessage,
	dismissMessage,
}) => {
	const styles = useStyles();
	const prefix = prefixByIntent[appMessage.intent];

	const borderClassMap = {
		success: styles.successBorder,
		error: styles.errorBorder,
		warning: styles.warningBorder,
		info: styles.infoBorder,
	} as const;
	const borderClass = appMessage.visible
		? borderClassMap[appMessage.intent]
		: undefined;

	return (
		<div
			role="alert"
			className={mergeClasses(
				styles.messageBarContainer,
				appMessage.visible && styles.messageBarContainerVisible,
			)}
		>
			{appMessage.visible && (
				<MessageBar
					intent={appMessage.intent}
					className={borderClass}
					style={{ width: "100%" }}
				>
					<MessageBarBody>
						{prefix}
						{appMessage.text}
					</MessageBarBody>
					<Button
						appearance="transparent"
						icon={<DismissRegular aria-hidden="true" />}
						onClick={dismissMessage}
						aria-label="Dismiss message"
						className={styles.dismissButton}
					/>
				</MessageBar>
			)}
		</div>
	);
};
