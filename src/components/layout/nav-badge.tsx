import type { NavItem } from "#/components/layout/nav-items";
import type { NavStatus } from "#/lib/dashboard.functions";
import { t, tf } from "#/lib/i18n";
import { cn } from "#/lib/utils";

/** Count of open reports or a dot for data sources; nothing when all is well. */
export function NavBadge({
	item,
	status,
	compact = false,
}: {
	item: NavItem;
	status: NavStatus | undefined;
	compact?: boolean;
}) {
	if (item.badge === "reports" && status?.openReports) {
		const count = status.openReports;
		const label = tf("{count} offene Meldungen", { count });
		return compact ? (
			<span
				className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive"
				role="img"
				aria-label={label}
			/>
		) : (
			<span className="ml-auto min-w-5 rounded-full bg-destructive px-1.5 text-center text-[11px] font-semibold leading-5 text-destructive-foreground">
				<span aria-hidden>{count > 99 ? "99+" : count}</span>
				<span className="sr-only">{label}</span>
			</span>
		);
	}
	if (item.badge === "sources" && status?.sourcesNeedAttention)
		return (
			<span
				className={cn(
					"size-2 rounded-full bg-hc-warning",
					compact ? "absolute top-1.5 right-1.5" : "ml-auto",
				)}
				role="img"
				aria-label={t("Datenquelle braucht Aufmerksamkeit")}
			/>
		);
	return null;
}
