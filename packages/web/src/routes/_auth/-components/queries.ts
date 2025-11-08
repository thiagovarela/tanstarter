import { getInvitationForLink } from "./server";
import type { InvitationLinkDetail } from "./types";

export const invitationDetailQueryKey = (invitationId: string) =>
	["invitations", invitationId] as const;

export const getInvitationDetailQueryOptions = (invitationId: string) => ({
	queryKey: invitationDetailQueryKey(invitationId),
	queryFn: async (): Promise<InvitationLinkDetail | null> =>
		getInvitationForLink({ data: { invitationId } }),
});
