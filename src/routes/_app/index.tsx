import type { TablerIcon } from "@tabler/icons-react";
import {
	IconActivity,
	IconCalendarPlus,
	IconCircleCheck,
	IconFlag,
	IconPlus,
	IconSpeakerphone,
	IconUserPlus,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "#/components/layout/page-header";
import { Button } from "#/components/ui/button";
import { type AttentionItem, attentionItems } from "#/lib/attention";
import { ROUTES } from "#/lib/constants";
import {
	type DashboardSummary,
	getDashboardSummaryFn,
} from "#/lib/dashboard.functions";
import { formatDate, formatRelative, t, tf, useLocale } from "#/lib/i18n";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/_app/")({
	loader: () => getDashboardSummaryFn(),
	component: Today,
});

const ICONS: Record<AttentionItem["icon"], TablerIcon> = {
	reports: IconFlag,
	announcement: IconSpeakerphone,
	source: IconActivity,
};

/** Greeting by the hour in Hamburg, so server and browser render the same text. */
function greeting(now: string) {
	const hour = Number(
		new Intl.DateTimeFormat("en-GB", {
			hour: "numeric",
			hourCycle: "h23",
			timeZone: "Europe/Berlin",
		}).format(new Date(now)),
	);
	if (hour < 11) return "Guten Morgen, {name}";
	if (hour < 18) return "Guten Tag, {name}";
	return "Guten Abend, {name}";
}

/** Page and source names are our own words, so they are translated; titles are user content. */
const names = (params: AttentionItem["params"]) =>
	"name" in params ? { ...params, name: t(String(params.name)) } : params;

function Today() {
	useLocale();
	const { user } = Route.useRouteContext();
	const summary = Route.useLoaderData();
	const items = attentionItems({
		now: new Date(summary.now),
		marketplace: summary.marketplace,
		announcements: summary.announcements,
		services: summary.services,
	});
	const count = items.length;
	return (
		<>
			<PageHeader
				title={tf(greeting(summary.now), { name: user.name })}
				lead={
					count === 0
						? t("Alles erledigt. Gerade wartet nichts auf dich.")
						: count === 1
							? t("1 Punkt braucht deine Aufmerksamkeit.")
							: tf("{count} Punkte brauchen deine Aufmerksamkeit.", { count })
				}
			/>
			{summary.partial && (
				<p role="status" className="error-banner">
					{t("Einige Angaben konnten nicht geladen werden.")}
				</p>
			)}
			<AttentionList items={items} now={summary.now} />
			<QuickActions capabilities={summary.capabilities} />
			<div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
				{summary.capabilities.announcements && (
					<ComingUp rows={summary.announcements} />
				)}
				{summary.services && <Sources services={summary.services} />}
			</div>
		</>
	);
}

function AttentionList({
	items,
	now,
}: {
	items: AttentionItem[];
	now: string;
}) {
	if (!items.length)
		return (
			<section className="panel flex items-center gap-4">
				<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
					<IconCircleCheck stroke={1.75} className="size-5" aria-hidden />
				</span>
				<div className="min-w-0">
					<h2 className="font-semibold">{t("Nichts offen")}</h2>
					<p className="text-sm text-muted-foreground">
						{t("Meldungen, Fristen und Datenquellen sind in Ordnung.")}
					</p>
				</div>
			</section>
		);
	return (
		<section aria-labelledby="attention-title" className="space-y-3">
			<h2
				id="attention-title"
				className="text-sm font-semibold text-muted-foreground"
			>
				{t("Braucht Aufmerksamkeit")}
			</h2>
			<ul className="panel divide-y divide-border !py-1">
				{items.map((item) => {
					const Icon = ICONS[item.icon];
					const dates = Object.fromEntries(
						Object.entries(item.dates ?? {}).map(([key, value]) => [
							key,
							key === "oldest"
								? formatRelative(value, new Date(now))
								: formatDate(value),
						]),
					);
					return (
						<li
							key={item.key}
							className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3"
						>
							<span
								className={cn(
									"flex size-9 shrink-0 items-center justify-center rounded-full",
									item.tone === "danger"
										? "bg-[color-mix(in_oklab,var(--hc-danger)_10%,var(--card))] text-hc-danger"
										: "bg-[color-mix(in_oklab,var(--hc-warning)_6%,var(--card))] text-hc-warning",
								)}
							>
								<Icon className="size-4" stroke={1.75} aria-hidden />
							</span>
							<div className="min-w-0 flex-1 basis-48">
								<p className="break-words font-medium">
									{tf(item.title, names(item.params))}
								</p>
								{item.detail && (
									<p className="text-sm text-muted-foreground">
										{tf(item.detail, { ...names(item.params), ...dates })}
									</p>
								)}
							</div>
							<Button
								asChild
								size="sm"
								variant="outline"
								className="ml-12 sm:ml-0"
							>
								<Link
									to={item.href}
									params={item.hrefParams}
									// The reports page records who viewed which identities: no preloading.
									preload={item.icon === "reports" ? false : undefined}
								>
									{t(item.action)}
								</Link>
							</Button>
						</li>
					);
				})}
			</ul>
		</section>
	);
}

function QuickActions({
	capabilities,
}: {
	capabilities: DashboardSummary["capabilities"];
}) {
	const actions = [
		capabilities.announcements && {
			to: "/announcements/new",
			label: "Neue Ankündigung",
			icon: IconPlus,
		},
		capabilities.events && {
			to: ROUTES.EVENTS,
			label: "Neue Club-Veranstaltung",
			icon: IconCalendarPlus,
		},
		capabilities.admin && {
			to: ROUTES.PERMISSIONS,
			label: "Team-Mitglied hinzufügen",
			icon: IconUserPlus,
		},
	].filter((a): a is { to: string; label: string; icon: TablerIcon } =>
		Boolean(a),
	);
	if (!actions.length) return null;
	return (
		<section aria-labelledby="quick-actions-title" className="space-y-3">
			<h2
				id="quick-actions-title"
				className="text-sm font-semibold text-muted-foreground"
			>
				{t("Schnellaktionen")}
			</h2>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{actions.map((action) => {
					const Icon = action.icon;
					return (
						<Link
							key={action.to}
							to={action.to}
							className="panel flex items-center gap-3 !py-4 font-medium text-primary no-underline transition-colors hover:bg-muted"
						>
							<Icon className="size-4 shrink-0" stroke={1.75} aria-hidden />
							{t(action.label)}
						</Link>
					);
				})}
			</div>
		</section>
	);
}

function ComingUp({ rows }: { rows: DashboardSummary["announcements"] }) {
	return (
		<section className="panel space-y-3">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-lg font-semibold">{t("Demnächst in der App")}</h2>
				<Button variant="outline" size="sm" asChild>
					<Link to={ROUTES.ANNOUNCEMENTS}>{t("Alle anzeigen")}</Link>
				</Button>
			</div>
			{rows.length ? (
				<ul className="divide-y divide-border">
					{rows.slice(0, 5).map((row) => (
						<li key={row.id}>
							<Link
								to="/announcements/$id"
								params={{ id: row.id }}
								className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-3 text-sm no-underline"
							>
								<span className="min-w-0 break-words font-medium">
									{row.title}
								</span>
								<span className="text-muted-foreground">
									{row.status === "active"
										? tf("Aktiv bis {end}", {
												end: formatDate(row.endDateTime),
											})
										: tf("Startet am {start}", {
												start: formatDate(row.startDateTime),
											})}
								</span>
							</Link>
						</li>
					))}
				</ul>
			) : (
				<p className="text-sm text-muted-foreground">
					{t("Keine aktiven oder geplanten Ankündigungen.")}
				</p>
			)}
		</section>
	);
}

function Sources({ services }: { services: DashboardSummary["services"] }) {
	return (
		<section className="panel space-y-3">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-lg font-semibold">{t("Datenquellen")}</h2>
				<Button variant="outline" size="sm" asChild>
					<Link to={ROUTES.OPERATIONS}>{t("Ansehen")}</Link>
				</Button>
			</div>
			<ul className="divide-y divide-border">
				{(services ?? []).map((row) => {
					const state = !row.available
						? "Nicht verfügbar"
						: row.stale
							? "Veraltet"
							: "Verfügbar";
					return (
						<li
							key={row.name}
							className="flex items-center justify-between gap-3 py-3 text-sm"
						>
							<span className="flex items-center gap-2">
								<span
									aria-hidden
									className={cn(
										"size-2 rounded-full",
										!row.available
											? "bg-hc-danger"
											: row.stale
												? "bg-hc-warning"
												: "bg-hc-success",
									)}
								/>
								{t(row.name)}
							</span>
							<span className="text-muted-foreground">{t(state)}</span>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
