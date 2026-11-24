import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "#/components/ui/badge";
import { DataTableColumnHeader } from "#/components/ui/dataTable/columnHeader";
import { DataTable } from "#/components/ui/dataTable/dataTable";
import { formatDate, t, useLocale } from "#/lib/i18n";
import { formatEnumLabel } from "#/lib/labels";
import type { AuditLogEntry } from "#/lib/schemas/audit-log";

const OPERATION_LABELS: Record<string, string> = {
	insert: "Erstellt",
	update: "Bearbeitet",
	delete: "Gelöscht",
	save: "Gespeichert",
	publish: "Veröffentlicht",
	withdraw: "Zurückgezogen",
	import: "Importiert",
	view: "Angesehen",
	remove: "Entfernt",
	restore: "Wiederhergestellt",
	dismiss: "Verworfen",
};

/** German source names for audit entities; unknown ones fall back to a readable form. */
const ENTITY_LABELS: Record<string, string> = {
	app_announcements: "Ankündigung",
	manual_cl_events: "Club-Veranstaltung",
	haw_club_content: "Club",
	haw_quick_links: "Quick Link",
	haw_organizer_profiles: "Veranstalterprofil",
	haw_legal_documents: "Rechtliche Seite",
	haw_admin_roles: "Berechtigung",
	haw_account: "Admin-Passwort",
	marketplace_post: "Marktplatz-Inserat",
	marketplace_report: "Marktplatz-Meldung",
	marketplace_block: "Marktplatz-Sperre",
	marketplace_identity: "Marktplatz-Kontaktdaten",
};
const entityLabel = (entity: string) =>
	t(ENTITY_LABELS[entity] ?? formatEnumLabel(entity));

const OPERATION_VARIANTS: Record<
	string,
	"default" | "secondary" | "destructive"
> = {
	insert: "default",
	update: "secondary",
	delete: "destructive",
};

const OPERATION_FILTER_OPTIONS = Object.entries(OPERATION_LABELS).map(
	([value, label]) => ({ label, value }),
);

const columns: ColumnDef<AuditLogEntry>[] = [
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title={t("Zeitpunkt")} />
		),
		size: 180,
		cell({ row: { original } }) {
			return formatDate(original.createdAt);
		},
	},
	{
		accessorKey: "operation",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title={t("Aktion")} />
		),
		size: 120,
		filterFn: (row, id, filterValue: string[]) => {
			const value = row.getValue<string>(id);
			return filterValue.includes(value);
		},
		cell({ row: { original } }) {
			return (
				<Badge variant={OPERATION_VARIANTS[original.operation] || "default"}>
					{t(
						OPERATION_LABELS[original.operation] ||
							formatEnumLabel(original.operation),
					)}
				</Badge>
			);
		},
	},
	{
		accessorKey: "entity",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title={t("Typ")} />
		),
		filterFn: (row, id, filterValue: string[]) => {
			const value = row.getValue<string>(id);
			return filterValue.includes(value);
		},
		cell({ row: { original } }) {
			return entityLabel(original.entity);
		},
	},
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title={t("Bezeichnung")} />
		),
		cell({ row: { original } }) {
			return original.name;
		},
	},
	{
		accessorKey: "entityId",
		header: () => t("Datensatz"),
		cell({ row: { original } }) {
			return (
				<span className="font-mono text-xs text-muted-foreground">
					{original.entityId}
				</span>
			);
		},
	},
	{
		accessorKey: "userId",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title={t("Benutzer")} />
		),
		cell({ row: { original } }) {
			return (
				<span className="font-mono text-xs text-muted-foreground">
					{original.userId}
				</span>
			);
		},
	},
];

function getEntityFilterOptions(entries: AuditLogEntry[]) {
	const unique = Array.from(
		new Set(entries.map((e) => e.entity).filter(Boolean)),
	);
	return unique.map((entity) => ({
		label: entityLabel(entity),
		value: entity,
	}));
}

export function AuditTable({ entries }: { entries: AuditLogEntry[] }) {
	useLocale();

	const entityOptions = getEntityFilterOptions(entries);

	return (
		<DataTable
			tableId="auditlog"
			columns={columns}
			data={entries}
			enablePagination
			enableFilter
			initialPageSize={20}
			initialSorting={[{ id: "createdAt", desc: true }]}
			filterOptions={{
				searchFilter: {
					column: "name",
					title: t("Bezeichnung"),
				},
				selectFilters: [
					{
						column: "operation",
						title: t("Aktion"),
						mode: "multiple",
						options: OPERATION_FILTER_OPTIONS,
					},
					{
						column: "entity",
						title: t("Typ"),
						mode: "multiple",
						options: entityOptions,
					},
				],
			}}
		/>
	);
}
