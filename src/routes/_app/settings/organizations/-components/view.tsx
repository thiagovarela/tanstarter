import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DataTable } from "@/components/table/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrganizationsQueryOptions } from "@/lib/modules/organizations/queries";
import type { Organization } from "@/lib/modules/organizations/types";

const columns: ColumnDef<Organization>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => (
			<span className="font-medium text-foreground">{row.original.name}</span>
		),
	},
	{
		accessorKey: "slug",
		header: "Slug",
	},
	{
		accessorKey: "createdAt",
		header: "Created",
		cell: ({ row }) => {
			const formatted = format(new Date(row.original.createdAt), "MMM d, yyyy");
			return <span className="text-muted-foreground">{formatted}</span>;
		},
	},
];

export function OrganizationsView() {
	const { data } = useSuspenseQuery(getOrganizationsQueryOptions());
	const navigate = useNavigate();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Organizations</CardTitle>
			</CardHeader>
			<CardContent>
				<DataTable
					columns={columns}
					data={data}
					emptyMessage="No organizations yet."
					onRowClick={(organization) =>
						navigate({
							to: "/settings/organizations/$organizationId",
							params: { organizationId: organization.id },
						})
					}
				/>
			</CardContent>
		</Card>
	);
}
