import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { GoogleIcon } from "@/components/ui/google-icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { getInvitationDetailQueryOptions } from "./queries";
import { type AuthClientError, getAuthErrorMessage } from "./utils";

// Inline Zod schema
const loginSchema = z.object({
	email: z.email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

type LoginProps = React.ComponentProps<"div"> & {
	invitationId?: string;
};

export function Login({ className, invitationId, ...props }: LoginProps) {
	const navigate = useNavigate();
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true);
		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: "/projects",
			});
		} catch (error) {
			console.error("Google sign-in error:", error);
			toast.error("Failed to sign in with Google. Please try again.");
		} finally {
			setIsGoogleLoading(false);
		}
	};

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onChange: loginSchema,
		},
		onSubmit: async ({ value }) => {
			const emailToUse =
				invitationValid && invitation ? invitation.email : value.email;

			const result = await authClient.signIn.email({
				email: emailToUse,
				password: value.password,
				callbackURL: "/projects",
			});

			if (result.error) {
				toast.error(getAuthErrorMessage(result.error as AuthClientError));
				return;
			}

			toast.success("Login successful!");

			let handledNavigation = false;

			if (invitationId && invitationValid && invitation) {
				try {
					await authClient.organization.acceptInvitation({
						invitationId,
					});
					toast.success(
						`Joined ${invitation.organizationName} as ${invitation.role ?? "member"}.`,
					);
					navigate({
						to: "/settings/organizations/$organizationId",
						params: { organizationId: invitation.organizationId },
					});
					handledNavigation = true;
				} catch (error) {
					console.error(error);
					toast.error(
						"Logged in, but we could not accept your invitation. Visit settings or ask for a new invite.",
					);
				}
			}

			if (
				result.data?.redirect &&
				result.data.url &&
				typeof window !== "undefined"
			) {
				window.location.assign(result.data.url);
				return;
			}

			if (!handledNavigation) {
				navigate({ to: "/projects" });
			}
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
					<CardTitle>Login to your account</CardTitle>
					<CardDescription>
						Enter your email below to login to your account
					</CardDescription>
					{invitationId ? (
						<div className="border-muted-foreground/20 text-muted-foreground rounded-md border border-dashed bg-muted/30 p-3 text-sm">
							{invitationQuery.isLoading ? (
								<span>Checking your invitation...</span>
							) : invitationValid && invitation ? (
								<span>
									Accept your invite to{" "}
									<strong>{invitation.organizationName}</strong> after you sign
									in.
								</span>
							) : (
								<span>
									This invitation is no longer active. You can still sign in to
									your account.
								</span>
							)}
						</div>
					) : null}
				</CardHeader>
				<CardContent>
					<div className="grid gap-6">
						{/* Google OAuth Button */}
						<Button
							variant="outline"
							onClick={handleGoogleSignIn}
							disabled={isGoogleLoading || form.state.isSubmitting}
							className="w-full"
						>
							<GoogleIcon className="mr-2" />
							{isGoogleLoading
								? "Signing in with Google..."
								: "Continue with Google"}
						</Button>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">
									Or continue with email
								</span>
							</div>
						</div>

						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								void form.handleSubmit();
							}}
						>
							<FieldGroup>
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
								<div className="flex items-center">
									<button
										type="button"
										className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
									>
										Forgot your password?
									</button>
								</div>
								<Button
									type="submit"
									disabled={form.state.isSubmitting}
									className="w-full"
								>
									{form.state.isSubmitting ? "Logging in..." : "Login"}
								</Button>
								<div className="text-center text-sm">
									Don&apos;t have an account?{" "}
									<Link
										to="/register"
										search={(current) => ({
											...current,
											invitationId: invitationId ?? current?.invitationId,
										})}
										className="underline underline-offset-4 hover:underline"
									>
										Sign up
									</Link>
								</div>
							</FieldGroup>
						</form>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
