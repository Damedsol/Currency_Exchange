import type { ButtonProps } from "@fluentui/react-components";
import { Button } from "@fluentui/react-components";
import "./ButonBase.css";

export const ButtonBase = (props: ButtonProps) => (
	<Button size={"large"} className={"btn"} {...props}>
		{props.children}
	</Button>
);
