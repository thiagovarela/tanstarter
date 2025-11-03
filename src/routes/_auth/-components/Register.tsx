import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
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

export function Register({ className, ...props }: React.ComponentProps<"div">) {
	const navigate = useNavigate();

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
			const result = await authClient.signUp.email({
				name: value.name,
				email: value.email,
				password: value.password,
				callbackURL: "/projects",
			});

			if (result.error) {
				toast.error(getAuthErrorMessage(result.error as AuthClientError));
				return;
			}

			toast.success("Registration successful! Please verify your e-mail");

			navigate({ to: "/login" });
		},
	});

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Register your account</CardTitle>
					<CardDescription>
						Enter your email below to create your account
					</CardDescription>
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
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
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
