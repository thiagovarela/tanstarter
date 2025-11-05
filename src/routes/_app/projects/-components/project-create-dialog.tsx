import { type FormEvent, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProjectMutation } from "./queries";

type ProjectCreateDialogProps = {
	organizationId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ProjectCreateDialog({
	organizationId,
	open,
	onOpenChange,
}: ProjectCreateDialogProps) {
	const [name, setName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const createProject = useCreateProjectMutation(organizationId);

	const dialogId = useId();

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		event.stopPropagation();

		const trimmed = name.trim();
		if (!trimmed) {
			setError("Project name is required");
			return;
		}

		try {
			await createProject.mutateAsync({ name: trimmed });
			toast.success("Project created.");
			onOpenChange(false);
		} catch (mutationError) {
			console.error(mutationError);
			toast.error("Couldn't create project. Try again.");
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (createProject.isPending) {
					return;
				}
				onOpenChange(nextOpen);
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New project</DialogTitle>
					<DialogDescription>
						Give the project a name. You can add details after it’s created.
					</DialogDescription>
				</DialogHeader>

				<form className="space-y-6" onSubmit={handleSubmit}>
					<FieldGroup className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="project-name">Project name</Label>
							<Input
								id={dialogId}
								value={name}
								onChange={(event) => {
									setName(event.target.value);
									if (error) {
										setError(null);
									}
								}}
								autoFocus
								placeholder="Roadmap refresh"
								disabled={createProject.isPending}
							/>
							{error ? (
								<p className="text-xs text-destructive">{error}</p>
							) : null}
						</div>
					</FieldGroup>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={createProject.isPending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={createProject.isPending}>
							{createProject.isPending ? "Creating..." : "Create project"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
