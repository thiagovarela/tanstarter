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

// Inline Zod schema
const loginSchema = z.object({
	email: z.email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export function Login({ className, ...props }: React.ComponentProps<"div">) {
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onChange: loginSchema,
		},
		onSubmit: async ({ value }) => {
			const result = await authClient.signIn.email({
				email: value.email,
				password: value.password,
				callbackURL: "/projects",
			});

			if (result.error) {
				toast.error(getAuthErrorMessage(result.error as AuthClientError));
				return;
			}

			toast.success("Login successful!");

			if (
				result.data?.redirect &&
				result.data.url &&
				typeof window !== "undefined"
			) {
				window.location.assign(result.data.url);
				return;
			}

			navigate({ to: "/projects" });
		},
	});

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Login to your account</CardTitle>
					<CardDescription>
						Enter your email below to login to your account
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
									className="underline underline-offset-4 hover:underline"
								>
									Sign up
								</Link>
							</div>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
