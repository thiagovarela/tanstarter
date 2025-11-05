import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { FieldInfo } from "@/components/form/field-info";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { getInvitationDetailQueryOptions } from "./queries";
import { type AuthClientError, getAuthErrorMessage } from "./utils";

// Inline Zod schema with password confirmation
const registerSchema = z
	.object({
		name: z.string().min(1),
		email: z.email("Invalid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type RegisterProps = React.ComponentProps<"div"> & {
	invitationId?: string;
};

export function Register({ className, invitationId, ...props }: RegisterProps) {
	const navigate = useNavigate();
	const invitationQuery = useQuery({
		...(invitationId
			? getInvitationDetailQueryOptions(invitationId)
			: {
					queryKey: ["invitations", "none"],
					queryFn: async () => null,
				}),
		enabled: Boolean(invitationId),
		staleTime: 60_000,
	});

	const invitation = invitationQuery.data;
	const invitationValid =
		Boolean(invitation) &&
		invitation?.status === "pending" &&
		invitation.isExpired === false;

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		validators: {
			onChange: registerSchema,
		},
		onSubmit: async ({ value }) => {
			const emailToUse =
				invitationValid && invitation ? invitation.email : value.email;

			const result = await authClient.signUp.email({
				name: value.name,
				email: emailToUse,
				password: value.password,
			});

			if (result.error) {
				toast.error(getAuthErrorMessage(result.error as AuthClientError));
				return;
			}

			// Handle invitation flow: auto sign-in and accept invite
			if (invitationValid && invitationId && invitation) {
				const signInResult = await authClient.signIn.email({
					email: emailToUse,
					password: value.password,
				});

				if (signInResult.error) {
					toast.error(
						"Account created, but we couldn't sign you in automatically. Please log in with your new credentials.",
					);
					navigate({
						to: "/login",
						search: (current) => ({
							...current,
							invitationId,
						}),
					});
					return;
				}

				try {
					await authClient.organization.acceptInvitation({
						invitationId,
					});
					toast.success(
						`You're in! Welcome to ${
							invitation.organizationName
						} as ${invitation.role ?? "member"}.`,
					);
					navigate({
						to: "/settings/organizations/$organizationId",
						params: { organizationId: invitation.organizationId },
					});
					return;
				} catch (error) {
					console.error(error);
					toast.error(
						"Signed in, but we couldn't accept your invitation automatically. You can retry from the invitation link.",
					);
					navigate({ to: "/projects" });
					return;
				}
			}

			toast.success("Account created! You're ready to sign in.");

			navigate({
				to: "/login",
				search: (current) => ({
					...current,
					invitationId: invitationId ?? current?.invitationId,
				}),
			});
		},
	});

	useEffect(() => {
		if (invitationValid && invitation) {
			form.setFieldValue("email", () => invitation.email, {
				dontUpdateMeta: true,
				dontValidate: true,
			});
		}
	}, [form, invitation, invitationValid]);

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Register your account</CardTitle>
					<CardDescription>
						Enter your email below to create your account
					</CardDescription>
					{invitationId ? (
						<div className="border-muted-foreground/20 text-muted-foreground rounded-md border border-dashed bg-muted/30 p-3 text-sm">
							{invitationQuery.isLoading ? (
								<span>Checking your invitation...</span>
							) : invitationValid && invitation ? (
								<span>
									You&apos;re joining{" "}
									<strong>{invitation.organizationName}</strong> as{" "}
									<span className="capitalize">
										{invitation.role ?? "member"}
									</span>
									.
								</span>
							) : (
								<span>
									This invitation is no longer active. You can still create an
									account and request a new invite.
								</span>
							)}
						</div>
					) : null}
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<FieldGroup>
							<form.Field name="name">
								{(field) => (
									<div className="grid gap-2">
										<Label htmlFor={field.name}>Name</Label>
										<Input
											id={field.name}
											type="text"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										<FieldInfo field={field} />
									</div>
								)}
							</form.Field>
							<form.Field name="email">
								{(field) => (
									<div className="grid gap-2">
										<Label htmlFor={field.name}>Email</Label>
										<Input
											id={field.name}
											type="email"
											placeholder="m@example.com"
											value={
												invitationValid && invitation
													? invitation.email
													: field.state.value
											}
											onBlur={field.handleBlur}
											onChange={(e) => {
												if (invitationValid) {
													return;
												}
												field.handleChange(e.target.value);
											}}
											disabled={invitationValid}
										/>
										{invitationValid ? (
											<p className="text-muted-foreground text-xs">
												Email locked to the invitation recipient.
											</p>
										) : null}
										<FieldInfo field={field} />
									</div>
								)}
							</form.Field>
							<form.Field name="password">
								{(field) => (
									<div className="grid gap-2">
										<Label htmlFor={field.name}>Password</Label>
										<Input
											id={field.name}
											type="password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										<FieldInfo field={field} />
									</div>
								)}
							</form.Field>
							<form.Field name="confirmPassword">
								{(field) => (
									<div className="grid gap-2">
										<Label htmlFor={field.name}>Confirm Password</Label>
										<Input
											id={field.name}
											type="password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										<FieldInfo field={field} />
									</div>
								)}
							</form.Field>
							<Button
								type="submit"
								disabled={form.state.isSubmitting}
								className="w-full"
							>
								{form.state.isSubmitting ? "Signing up..." : "Sign Up"}
							</Button>
							<div className="text-center text-sm">
								Already have an account?{" "}
								<Link
									to="/login"
									search={(current) => ({
										...current,
										invitationId: invitationId ?? current?.invitationId,
									})}
									className="underline underline-offset-4 hover:underline"
								>
									Log in
								</Link>
							</div>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
