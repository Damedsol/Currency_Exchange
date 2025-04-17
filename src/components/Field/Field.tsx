import type { FieldProps } from "@fluentui/react-components";
import {
	Field as FluentField,
	Input as FluentInput,
} from "@fluentui/react-components";

export const Field = (
	props: Partial<FieldProps> & { value: string; type?: string },
) => {
	return (
		<FluentField
			label={props.label}
			validationState={props.validationState}
			validationMessage={props.validationMessage}
			required={props.required}
			{...props}
			size={"large"}
		>
			<FluentInput
				type={props.type || "text"}
				appearance={"filled-darker"}
				size={"large"}
				value={props.value}
			/>
		</FluentField>
	);
};
