import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type ClientUploadError, useUploadFile } from "better-upload/client";
import { format } from "date-fns";
import { MoreHorizontal, UploadCloud } from "lucide-react";
import type { ChangeEvent } from "react";
import { Suspense, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { FieldInfo } from "@/components/form/field-info";
import { useShellBreadcrumbs } from "@/components/shell/shell-breadcrumb-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { organizationNameSchema } from "./-components/detail-schema";
import { InviteMemberDialog } from "./-components/invite-member-dialog";
import {
	getOrganizationDetailQueryOptions,
	useUpdateOrganizationMutation,
} from "./-components/queries";

const updateFormSchema = z.object({
	name: organizationNameSchema,
});

const settingsTabs: Array<{
	value: string;
	label: string;
	disabled?: boolean;
}> = [{ value: "team", label: "Team" }];

const uploadMetadataSchema = z.object({
	organizationId: z.uuid(),
	objectKey: z.string(),
});

function isClientUploadError(
	error: unknown,
): error is ClientUploadError & Error {
	return (
		typeof error === "object" &&
		error !== null &&
		"type" in error &&
		typeof (error as { type?: unknown }).type === "string" &&
		"message" in error &&
		typeof (error as { message?: unknown }).message === "string"
	);
}

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
	const { data: organization } = useSuspenseQuery(
		getOrganizationDetailQueryOptions(organizationId),
	);
	const updateOrganization = useUpdateOrganizationMutation(organizationId);

	const breadcrumbs = useMemo(
		() => [
			{ label: "Organizations", to: "/settings/organizations" },
			{ label: organization.name },
		],
		[organization.name],
	);

	useShellBreadcrumbs(breadcrumbs);

	const upload = useUploadFile({
		api: "/api/uploads",
		route: "organization-logo",
	});
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleUpload = useCallback(
		async (file: File) => {
			try {
				const result = await upload.uploadAsync(file, {
					metadata: { organizationId },
				});

				const metadata = uploadMetadataSchema.parse(result.metadata);

				await updateOrganization.mutateAsync({
					organizationId,
					name: organization.name,
					logo: metadata.objectKey,
				});

				toast.success("Organization image updated.");
			} catch (error) {
				if (isClientUploadError(error)) {
					toast.error(error.message);
				} else {
					toast.error("Failed to upload image.");
					console.error(error);
				}
			} finally {
				upload.reset();
			}
		},
		[organizationId, organization.name, updateOrganization, upload],
	);

	const handleFileChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) {
				return;
			}

			void handleUpload(file);
			event.target.value = "";
		},
		[handleUpload],
	);

	const handlePickFile = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const uploadButtonLabel =
		upload.isPending && upload.progress > 0
			? `Uploading ${Math.round(upload.progress * 100)}%`
			: upload.isPending
				? "Uploading..."
				: "Update Image";

	const disableLogoActions = upload.isPending || updateOrganization.isPending;

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
	const logo = organization.logo
		? `${import.meta.env.VITE_MEDIA_PUBLIC_BASE_URL}${organization.logo}`
		: undefined;

	return (
		<div className="space-y-6">
			<div className="space-y-3">
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
											<AvatarImage src={logo} />
											<AvatarFallback>{organizationInitial}</AvatarFallback>
										</Avatar>
										<input
											ref={fileInputRef}
											type="file"
											accept="image/png,image/jpeg,image/webp"
											className="hidden"
											onChange={handleFileChange}
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={handlePickFile}
											disabled={disableLogoActions}
										>
											<UploadCloud className="size-4" />
											{uploadButtonLabel}
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
							<InviteMemberDialog organizationId={organizationId} />
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Name</TableHead>
											<TableHead>Role</TableHead>
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
													colSpan={3}
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
