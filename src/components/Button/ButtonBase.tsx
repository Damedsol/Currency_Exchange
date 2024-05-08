import type { ButtonProps } from "@fluentui/react-components";
import { Button } from "@fluentui/react-components";

export const ButtonBase = (props: ButtonProps) => (
	<Button {...props}>{props.children}</Button>
);
