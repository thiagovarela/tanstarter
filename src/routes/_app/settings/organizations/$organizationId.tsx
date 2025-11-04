import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Check, MoreHorizontal, UploadCloud, X } from "lucide-react";
import { Suspense } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { FieldInfo } from "@/components/form/field-info";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	getOrganizationDetailQueryOptions,
	useOrganizationDetailQuery,
	useUpdateOrganizationMutation,
} from "./-components/detail-queries";
import { organizationNameSchema } from "./-components/detail-schema";

const updateFormSchema = z.object({
	name: organizationNameSchema,
});

const settingsTabs: Array<{
	value: string;
	label: string;
	disabled?: boolean;
}> = [{ value: "team", label: "Team" }];

export const Route = createFileRoute(
	"/_app/settings/organizations/$organizationId",
)({
	loader: async ({ params, context }) => {
		await context.queryClient.ensureQueryData(
			getOrganizationDetailQueryOptions(params.organizationId),
		);
	},
	component: () => (
		<Suspense fallback={<div>Loading organization...</div>}>
			<OrganizationDetailRoute />
		</Suspense>
	),
});

function OrganizationDetailRoute() {
	const { organizationId } = Route.useParams();
	const { data: organization } = useOrganizationDetailQuery(organizationId);
	const updateOrganization = useUpdateOrganizationMutation(organizationId);

	const form = useForm({
		defaultValues: {
			name: organization.name,
		},
		validators: {
			onSubmit: updateFormSchema,
		},
		onSubmit: async ({ value, formApi }) => {
			try {
				const updated = await updateOrganization.mutateAsync({
					organizationId,
					name: value.name,
				});
				formApi.reset({ name: updated.name });
				toast.success("Organization settings saved.");
			} catch (error) {
				toast.error("Failed to update organization.");
				throw error;
			}
		},
	});

	const organizationInitial = organization.name?.charAt(0).toUpperCase() ?? "?";

	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link to="/settings/organizations">Organizations</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>{organization.name}</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
				<div className="flex flex-col gap-2">
					<h1 className="text-foreground text-3xl font-semibold tracking-tight">
						Settings
					</h1>
					<p className="text-muted-foreground">
						Manage organization information and team access.
					</p>
				</div>
			</div>

			<Tabs defaultValue="team" className="space-y-6">
				<TabsList>
					{settingsTabs.map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							disabled={tab.disabled}
						>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value="team" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Overview</CardTitle>
							<CardDescription>
								Update how your organization appears to team members.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={(event) => {
									event.preventDefault();
									event.stopPropagation();
									void form.handleSubmit();
								}}
								className="space-y-6"
							>
								<div className="flex flex-col gap-6 md:flex-row md:items-start">
									<div className="flex flex-col items-center gap-3">
										<Avatar className="h-20 w-20">
											<AvatarImage src={organization.logo ?? undefined} />
											<AvatarFallback>{organizationInitial}</AvatarFallback>
										</Avatar>
										<Button type="button" variant="outline" size="sm">
											<UploadCloud className="size-4" />
											Update Image
										</Button>
									</div>
									<FieldGroup className="w-full space-y-5">
										<form.Field name="name">
											{(field) => (
												<div className="grid gap-2">
													<Label htmlFor={field.name}>Team Name</Label>
													<Input
														id={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(event) =>
															field.handleChange(event.target.value)
														}
														placeholder="Team name"
														autoComplete="organization"
													/>
													<FieldInfo field={field} />
												</div>
											)}
										</form.Field>
									</FieldGroup>
								</div>

								<div className="flex justify-end">
									<Button type="submit" disabled={form.state.isSubmitting}>
										{form.state.isSubmitting ? "Saving..." : "Save"}
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div className="space-y-1">
								<CardTitle>Members</CardTitle>
								<CardDescription>
									Invite teammates and manage their access.
								</CardDescription>
							</div>
							<Button type="button" variant="outline">
								Invite
							</Button>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Name</TableHead>
											<TableHead>Role</TableHead>
											<TableHead>Enabled MFA</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{organization.members.length ? (
											organization.members.map((member) => {
												const joinedDate = new Date(member.joinedAt);
												const joinedLabel = Number.isNaN(joinedDate.getTime())
													? null
													: `Joined on ${format(joinedDate, "MMM d, yyyy")}`;
												const memberInitial =
													member.name?.charAt(0).toUpperCase() ??
													member.email.charAt(0).toUpperCase();

												return (
													<TableRow key={member.id}>
														<TableCell>
															<div className="flex items-center gap-3">
																<Avatar className="h-9 w-9">
																	<AvatarImage
																		src={member.avatarUrl ?? undefined}
																		alt={member.name ?? member.email}
																	/>
																	<AvatarFallback>
																		{memberInitial}
																	</AvatarFallback>
																</Avatar>
																<div className="flex flex-col gap-1">
																	<span className="font-medium">
																		{member.name || member.email}
																	</span>
																	<span className="text-muted-foreground text-sm">
																		{member.email}
																	</span>
																	{joinedLabel ? (
																		<span className="text-muted-foreground text-xs">
																			{joinedLabel}
																		</span>
																	) : null}
																</div>
															</div>
														</TableCell>
														<TableCell>
															<Badge variant="secondary" className="capitalize">
																{member.role}
															</Badge>
														</TableCell>
														<TableCell>
															{member.mfaEnabled ? (
																<Check className="size-4 text-emerald-500" />
															) : (
																<X className="size-4 text-muted-foreground" />
															)}
														</TableCell>
														<TableCell className="text-right">
															<Button type="button" variant="ghost" size="icon">
																<MoreHorizontal className="size-4" />
																<span className="sr-only">Open actions</span>
															</Button>
														</TableCell>
													</TableRow>
												);
											})
										) : (
											<TableRow>
												<TableCell
													colSpan={4}
													className="text-muted-foreground h-20 text-center"
												>
													No members yet.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
