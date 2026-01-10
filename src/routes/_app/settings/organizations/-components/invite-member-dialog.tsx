import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { FieldInfo } from "@/components/form/field-info";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useInviteOrganizationMemberMutation } from "@/lib/modules/organizations/queries";
import { inviteOrganizationMemberSchema } from "@/lib/modules/organizations/types";

const inviteMemberFormSchema = z.object({
	email: inviteOrganizationMemberSchema.shape.email,
	name: z
		.string()
		.trim()
		.max(64, "Name must be at most 64 characters")
		.refine(
			(value) => value.length === 0 || value.trim().length >= 2,
			"Name must be at least 2 characters",
		),
	role: inviteOrganizationMemberSchema.shape.role,
});

type InviteMemberFormValues = z.infer<typeof inviteMemberFormSchema>;

type InviteMemberDialogProps = {
	organizationId: string;
};

export function InviteMemberDialog({
	organizationId,
}: InviteMemberDialogProps) {
	const [open, setOpen] = useState(false);
	const inviteMember = useInviteOrganizationMemberMutation(organizationId);
	const defaultValues: InviteMemberFormValues = {
		email: "",
		name: "",
		role: "member",
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: inviteMemberFormSchema,
		},
		onSubmit: async ({ value, formApi }) => {
			const name = value.name.trim();

			try {
				await inviteMember.mutateAsync({
					organizationId,
					email: value.email.trim(),
					role: value.role,
					name: name.length ? name : undefined,
				});

				toast.success("Invitation sent.");
				formApi.reset({ ...defaultValues });
				setOpen(false);
			} catch (error) {
				console.error(error);
				toast.error("Failed to send invitation.");
				throw error;
			}
		},
	});

	useEffect(() => {
		if (!open) {
			form.reset({ ...defaultValues });
			inviteMember.reset();
		}
	}, [form, inviteMember, open]);

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (inviteMember.isPending) {
					return;
				}
				setOpen(nextOpen);
			}}
		>
			<DialogTrigger asChild>
				<Button type="button" variant="outline">
					Invite
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invite teammate</DialogTitle>
					<DialogDescription>
						Send an invitation to join this organization.
					</DialogDescription>
				</DialogHeader>

				<form
					className="space-y-6"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<FieldGroup className="space-y-4">
						<form.Field name="email">
							{(field) => (
								<div className="grid gap-2">
									<Label htmlFor={field.name}>Email</Label>
									<Input
										id={field.name}
										type="email"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										autoComplete="email"
										placeholder="person@example.com"
									/>
									<FieldInfo field={field} />
								</div>
							)}
						</form.Field>

						<form.Field name="name">
							{(field) => (
								<div className="grid gap-2">
									<div className="flex items-center justify-between">
										<Label htmlFor={field.name}>Name</Label>
										<span className="text-muted-foreground text-xs">
											Optional
										</span>
									</div>
									<Input
										id={field.name}
										type="text"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										placeholder="Teammate name"
										autoComplete="name"
									/>
									<FieldInfo field={field} />
								</div>
							)}
						</form.Field>

						<form.Field name="role">
							{(field) => (
								<div className="grid gap-2">
									<Label htmlFor={field.name}>Role</Label>
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(
												value as InviteMemberFormValues["role"],
											)
										}
									>
										<SelectTrigger id={field.name} className="w-full">
											<SelectValue placeholder="Select a role" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="member">Member</SelectItem>
											<SelectItem value="admin">Admin</SelectItem>
										</SelectContent>
									</Select>
									<FieldInfo field={field} />
								</div>
							)}
						</form.Field>
					</FieldGroup>

					<DialogFooter>
						<DialogClose asChild>
							<Button
								type="button"
								variant="outline"
								disabled={inviteMember.isPending}
							>
								Cancel
							</Button>
						</DialogClose>
						<Button
							type="submit"
							disabled={form.state.isSubmitting || inviteMember.isPending}
						>
							{inviteMember.isPending ? "Sending..." : "Send invite"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
