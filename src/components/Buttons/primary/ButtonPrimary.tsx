import { Button, ButtonProps } from "@fluentui/react-components";
import React from "react";

// No custom styles needed if using standard appearance="primary"

export const ButtonPrimary: React.FC<ButtonProps> = (props) => {
	// Use Fluent UI Button directly, passing all props
	// Default type is "button", which is good.
	return (
		<Button appearance="primary" {...props}>
			{props.children}
		</Button>
	);
};
