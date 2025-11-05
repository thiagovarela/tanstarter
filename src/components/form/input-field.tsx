import type { AnyFieldApi } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldInfo } from "./field-info";

type InputFieldProps = {
	field: AnyFieldApi;
	label: string;
	placeholder?: string;
	type?: React.ComponentProps<typeof Input>["type"];
	autoFocus?: boolean;
};

export function InputField({
	field,
	label,
	placeholder,
	type = "text",
	autoFocus,
}: InputFieldProps) {
	return (
		<div className="grid gap-2">
			<Label htmlFor={field.name}>{label}</Label>
			<Input
				id={field.name}
				name={field.name}
				value={field.state.value ?? ""}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				placeholder={placeholder}
				type={type}
				autoFocus={autoFocus}
			/>
			<FieldInfo field={field} />
		</div>
	);
}
