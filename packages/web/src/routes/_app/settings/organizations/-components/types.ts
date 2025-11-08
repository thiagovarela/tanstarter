export type Organization = {
	id: string;
	name: string;
	slug: string;
	createdAt: string;
};

export type OrganizationMember = {
	id: string;
	name: string | null;
	email: string;
	role: string;
	joinedAt: string;
	mfaEnabled: boolean;
	avatarUrl: string | null;
};

export type OrganizationDetail = {
	id: string;
	name: string;
	slug: string;
	logo: string | null;
	createdAt: string;
	members: OrganizationMember[];
};

export type UpdateOrganizationInput = {
	organizationId: string;
	name: string;
	logo?: string | null;
};

export type InviteOrganizationMemberInput = {
	organizationId: string;
	email: string;
	name?: string;
	role: "admin" | "member";
};
