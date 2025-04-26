import {
	makeStyles,
	tokens,
	MessageBar,
	MessageBarBody,
	Button,
	type MessageBarIntent,
	mergeClasses,
} from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";
import React from "react";

// Styles specific to the message bar, adapted from App.tsx
const useStyles = makeStyles({
	messageBarContainer: {
		transitionProperty: "max-height, opacity",
		transitionDuration: "0.3s",
		transitionTimingFunction: "ease-in-out",
		overflow: "hidden",
		maxHeight: 0,
		opacity: 0,
	},
	messageBarContainerVisible: {
		maxHeight: "60px", // Adjust as needed
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
});

// App Message type (copied from App.tsx)
interface AppMessage {
	text: React.ReactNode | null;
	intent: MessageBarIntent;
	visible: boolean;
}

interface AppMessageBarProps {
	appMessage: AppMessage;
	dismissMessage: () => void;
}

export const AppMessageBar: React.FC<AppMessageBarProps> = ({
	appMessage,
	dismissMessage,
}) => {
	const styles = useStyles();

	return (
		<div
			className={mergeClasses(
				styles.messageBarContainer,
				appMessage.visible && styles.messageBarContainerVisible,
			)}
			// Add role="region" and aria-label for better landmark identification if needed
			// Or role="alert" if it's specifically for alerts, though MessageBar might handle this.
			// For now, keep it simple.
		>
			{appMessage.visible && (
				<MessageBar intent={appMessage.intent} style={{ width: "100%" }}>
					<MessageBarBody>
						{/* MessageBarTitle could be used if needed */}
						{appMessage.text}
					</MessageBarBody>
					<Button
						appearance="transparent"
						icon={<DismissRegular aria-hidden="true" />} // Hide icon if label is sufficient
						onClick={dismissMessage}
						aria-label="Dismiss message"
						className={styles.dismissButton}
					/>
				</MessageBar>
			)}
		</div>
	);
};
