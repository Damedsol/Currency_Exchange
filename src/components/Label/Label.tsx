import { Label as FluentLabel } from "@fluentui/react-components";

export const Label = (props: {
	text: string;
	size: "small" | "medium" | "large";
}) => {
	return <FluentLabel size={props.size}>{props.text}</FluentLabel>;
};
