import { createServerFn } from "@tanstack/react-start";
import { sql } from "@tanstarter/data";
import { z } from "zod";
import type { InvitationLinkDetail } from "./types";

const invitationIdSchema = z.object({
	invitationId: z.uuid(),
});

type InvitationRow = InvitationLinkDetail;

export const getInvitationForLink = createServerFn()
	.inputValidator(invitationIdSchema)
	.handler(async ({ data }): Promise<InvitationLinkDetail | null> => {
		const [invitation] = await sql<InvitationRow[]>`
			select
				i.id,
				i.email,
				i.role,
				i.status,
				i.expires_at,
				i.expires_at <= now() as is_expired,
				i.organization_id,
				o.name as organization_name,
				o.slug as organization_slug,
				i.inviter_id,
				u.email as inviter_email,
				u.name as inviter_name
			from invitations i
			inner join organizations o on o.id = i.organization_id
			inner join users u on u.id = i.inviter_id
			where i.id = ${data.invitationId}
			limit 1
		`;

		return invitation ?? null;
	});
