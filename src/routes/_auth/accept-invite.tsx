import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/integrations/better-auth/auth-provider";
import { authClient } from "@/lib/auth-client";
import {
	getInvitationDetailQueryOptions,
	invitationDetailQueryKey,
} from "./-components/queries";

const searchSchema = z.object({
	invitationId: z.uuid().optional(),
});

export const Route = createFileRoute("/_auth/accept-invite")({
	validateSearch: searchSchema,
	loader: async ({ context }) => {
		const search = Route.useSearch();
		if (search.invitationId) {
			await context.queryClient.ensureQueryData(
				getInvitationDetailQueryOptions(search.invitationId),
			);
		}
	},
	component: AcceptInviteRoute,
});

function AcceptInviteRoute() {
	const search = Route.useSearch();
	const invitationId = search?.invitationId ?? null;
	const safeInvitationId = invitationId ?? "";
	const auth = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: invitation } = useSuspenseQuery(
		getInvitationDetailQueryOptions(safeInvitationId),
	);

	const isPending =
		invitation?.status === "pending" && invitation.isExpired === false;
	const sessionEmail = auth.user.email ?? null;
	const invitationEmail = invitation?.email ?? null;
	const emailMismatch =
		sessionEmail !== null &&
		invitationEmail !== null &&
		sessionEmail.toLowerCase() !== invitationEmail.toLowerCase();

	const acceptInvitation = useMutation({
		mutationFn: async () => {
			if (!invitationId) {
				throw new Error("Invitation ID is required to accept the invite.");
			}
			return authClient.organization.acceptInvitation({ invitationId });
		},
		onSuccess: async () => {
			if (!invitationId) {
				return;
			}
			await queryClient.invalidateQueries({
				queryKey: invitationDetailQueryKey(invitationId),
			});
			const organizationId = invitation?.organizationId;

			toast.success(
				`Joined ${
					invitation?.organizationName ?? "the organization"
				} as ${invitation?.role ?? "member"}.`,
			);

			if (organizationId) {
				navigate({
					to: "/settings/organizations/$organizationId",
					params: { organizationId },
				});
			} else {
				navigate({ to: "/projects" });
			}
		},
		onError: (error) => {
			console.error(error);
			toast.error("Couldn't accept the invitation. Please try again.");
		},
	});

	const statusBadge = (() => {
		if (invitation?.isExpired) {
			return <Badge variant="destructive">Expired</Badge>;
		}
		if (invitation && invitation.status !== "pending") {
			return <Badge variant="secondary">{invitation.status}</Badge>;
		}
		if (isPending) {
			return <Badge variant="secondary">Pending</Badge>;
		}
		return null;
	})();

	if (!invitationId) {
		return <MissingInvitationCard />;
	}

	if (!invitation) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Invitation not found</CardTitle>
					<CardDescription>
						This invitation may have been revoked or is no longer valid.
					</CardDescription>
				</CardHeader>
				<CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
					<Button asChild variant="outline">
						<Link to="/">Return home</Link>
					</Button>
					<Button asChild>
						<Link to="/login">Sign in</Link>
					</Button>
				</CardFooter>
			</Card>
		);
	}

	const canAccept = Boolean(invitationId) && !emailMismatch && isPending;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between gap-2">
					<span>Join {invitation.organizationName}</span>
					{statusBadge}
				</CardTitle>
				<CardDescription>
					{invitation.inviterName
						? `${invitation.inviterName} invited you to join ${invitation.organizationName}.`
						: `${invitation.inviterEmail} invited you to join ${invitation.organizationName}.`}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="rounded-md border p-4">
					<dl className="grid gap-2 text-sm">
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Invite for</dt>
							<dd>{invitation.email}</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Role</dt>
							<dd className="capitalize">{invitation.role ?? "member"}</dd>
						</div>
						{invitation.expiresAt ? (
							<div className="flex items-center justify-between">
								<dt className="text-muted-foreground">Expires</dt>
								<dd>{invitation.expiresAt.toLocaleString()}</dd>
							</div>
						) : null}
					</dl>
				</div>

				{auth ? (
					<div className="space-y-2 text-sm">
						<p>
							Signed in as <strong>{auth.user.email}</strong>.
						</p>
						{emailMismatch ? (
							<p className="text-destructive">
								This invitation is for {invitation.email}. Please sign out and
								sign in with that email to continue.
							</p>
						) : !isPending ? (
							<p>
								This invitation can no longer be accepted. Contact{" "}
								{invitation.inviterEmail} for a new invite.
							</p>
						) : (
							<p>Review the details and accept the invitation below.</p>
						)}
					</div>
				) : (
					<div className="space-y-2 text-sm">
						<p>
							To join <strong>{invitation.organizationName}</strong>, sign in if
							you already have an account or create a new one below.
						</p>
					</div>
				)}
			</CardContent>
			<CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
				<div className="flex gap-2">
					<Button asChild variant="outline">
						<Link
							to="/login"
							search={{
								invitationId,
							}}
						>
							Sign in
						</Link>
					</Button>
					<Button asChild variant="secondary">
						<Link
							to="/register"
							search={{
								invitationId,
							}}
						>
							Create account
						</Link>
					</Button>
				</div>
				<Button
					onClick={() => {
						if (!canAccept) {
							return;
						}
						void acceptInvitation.mutateAsync();
					}}
					disabled={!canAccept || acceptInvitation.isPending}
				>
					{acceptInvitation.isPending ? "Accepting..." : "Accept invitation"}
				</Button>
			</CardFooter>
		</Card>
	);
}

function MissingInvitationCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Invitation required</CardTitle>
				<CardDescription>
					Use the invitation link from your email to access this page.
				</CardDescription>
			</CardHeader>
			<CardFooter className="flex justify-end">
				<Button asChild>
					<Link to="/login">Go to login</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
