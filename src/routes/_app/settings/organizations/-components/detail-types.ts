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
};
