import { Button, ButtonProps } from "@fluentui/react-components";
import React from "react";

// No custom styles needed if using standard appearance="outline"

export const ButtonSecondary: React.FC<ButtonProps> = (props) => {
	// Use Fluent UI Button directly with appearance="outline"
	return (
		<Button appearance="outline" {...props}>
			{props.children}
		</Button>
	);
};
