import type {ButtonProps} from "@fluentui/react-components";
import {Button} from "@fluentui/react-components";

export const ButtonBase = (props: ButtonProps) => (
	<Button
		size={"large"}
		style={{
			display: "flex",
			justifyContent: "center",
			width: "170px",
			height: "40px",
			padding: "6px 12px",
		}}
		{...props}
	>
		<span
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				width: "100%",
				height: "100%",
			}}
		>
			{props.children}
		</span>
	</Button>
);
