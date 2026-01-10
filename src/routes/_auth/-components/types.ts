export type InvitationLinkDetail = {
	id: string;
	email: string;
	role: string | null;
	status: string;
	expiresAt: Date | null;
	isExpired: boolean;
	organizationId: string;
	organizationName: string;
	organizationSlug: string;
	inviterId: string;
	inviterEmail: string;
	inviterName: string | null;
};
