import type { AnyFieldApi } from "@tanstack/react-form";

export function FieldInfo({ field }: { field: AnyFieldApi }) {
	return (
		<>
			{field.state.meta.isTouched && !field.state.meta.isValid ? (
				<div className="text-sm text-destructive">
					{field.state.meta.errors.join(", ")}
				</div>
			) : null}
			{field.state.meta.isValidating ? (
				<div className="text-sm text-muted-foreground">Validating...</div>
			) : null}
		</>
	);
}
