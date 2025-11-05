import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { ProjectListItem } from "./server";

const columns: ColumnDef<ProjectListItem>[] = [
	{
		accessorKey: "name",
		header: "Project",
		cell: ({ row }) => (
			<div className="flex flex-col">
				<span className="font-medium text-foreground">{row.original.name}</span>
				<span className="text-sm text-muted-foreground">
					{row.original.organizationName}
				</span>
			</div>
		),
	},
	{
		accessorKey: "archived",
		header: "Status",
		cell: ({ row }) => (
			<StatusBadge archived={Boolean(row.original.archived)} />
		),
	},
	{
		accessorKey: "updatedAt",
		header: "Last updated",
		cell: ({ row }) => (
			<span className="text-muted-foreground">
				{formatDistanceToNow(new Date(row.original.updatedAt), {
					addSuffix: true,
				})}
			</span>
		),
	},
];

type ProjectsTableProps = {
	projects: ProjectListItem[];
	emptyMessage?: string;
};

export function ProjectsTable({
	projects,
	emptyMessage = "No projects in this organization yet.",
}: ProjectsTableProps) {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base font-medium">Projects</CardTitle>
				<CardDescription>
					Projects for the currently active organization.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<DataTable
					columns={columns}
					data={projects}
					emptyMessage={emptyMessage}
				/>
			</CardContent>
		</Card>
	);
}

function StatusBadge({ archived }: { archived: boolean }) {
	if (archived) {
		return <Badge variant="secondary">Archived</Badge>;
	}
	return <Badge>Active</Badge>;
}
