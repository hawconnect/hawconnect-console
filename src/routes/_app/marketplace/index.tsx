import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { PageHeader } from "#/components/layout/page-header";
import { MarketplaceSubNav } from "#/components/marketplace/sub-nav";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { ROUTES } from "#/lib/constants";
import { formatDate, t, useLocale } from "#/lib/i18n";
import {
	decideMarketReportFn,
	listMarketReportsFn,
	type MarketReport,
} from "#/lib/marketplace.functions";
import { requireMarketplaceUser } from "#/lib/require-app-user";
import {
	decisionCopy,
	decisionLabel,
	listingFacts,
	marketplaceErrorMessage,
} from "#/lib/schemas/marketplace";

type Status = "open" | "decided";

export const Route = createFileRoute("/_app/marketplace/")({
	validateSearch: (search: Record<string, unknown>): { status: Status } => ({
		status: search.status === "decided" ? "decided" : "open",
	}),
	beforeLoad: ({ context }) => {
		requireMarketplaceUser(context.user);
	},
	loaderDeps: ({ search }) => ({ status: search.status }),
	loader: ({ deps }) => listMarketReportsFn({ data: { status: deps.status } }),
	component: MarketplaceReports,
});

function MarketplaceReports() {
	useLocale();
	const { status } = Route.useSearch();
	const { items } = Route.useLoaderData();
	const [notice, setNotice] = useState("");
	return (
		<>
			<PageHeader
				title={t("Marktplatz-Moderation")}
				lead={t("Gemeldete Inserate und Nachrichten prüfen.")}
				end={<MarketplaceSubNav current="reports" />}
			/>
			<div className="flex gap-2">
				{(["open", "decided"] as const).map((value) => (
					<Button
						asChild
						key={value}
						size="sm"
						variant={status === value ? "default" : "outline"}
					>
						<Link
							to={ROUTES.MARKETPLACE}
							search={{ status: value }}
							preload={false}
						>
							{value === "open" ? t("Offen") : t("Entschieden")}
						</Link>
					</Button>
				))}
			</div>
			{notice && (
				<p role="status" className="panel">
					{t(notice)}
				</p>
			)}
			<div className="space-y-4">
				{items.map((report) => (
					<ReportCard
						key={report.id}
						report={report}
						canDecide={status === "open"}
						onNotice={setNotice}
					/>
				))}
				{!items.length && (
					<p className="panel">{t("Keine Meldungen in dieser Ansicht.")}</p>
				)}
			</div>
		</>
	);
}

function ReportCard({
	report,
	canDecide,
	onNotice,
}: {
	report: MarketReport;
	canDecide: boolean;
	onNotice: (message: string) => void;
}) {
	const locale = useLocale();
	const router = useRouter();
	const [removing, setRemoving] = useState(false);
	const [reason, setReason] = useState("");
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);
	const gone = report.post.status === "gone";
	const copy = decisionCopy(report.kind);
	const decide = async (action: "dismiss" | "remove") => {
		setPending(true);
		setError("");
		onNotice("");
		try {
			const result = await decideMarketReportFn({
				data: { id: report.id, action, reason: reason.trim() || undefined },
			});
			// Only post removals send mail; message reports and dismissals never do.
			if (action === "remove" && report.kind === "post" && !result.mailSent)
				onNotice("Die Person konnte nicht per E-Mail benachrichtigt werden.");
			await router.invalidate();
		} catch (e) {
			setError(marketplaceErrorMessage(e, "decide"));
		} finally {
			setPending(false);
		}
	};
	return (
		<article className="panel space-y-3">
			<header className="flex flex-wrap items-baseline justify-between gap-2">
				<h2 className="text-lg font-semibold">
					{report.kind === "message"
						? t("Gemeldete Nachricht")
						: t("Gemeldetes Inserat")}
				</h2>
				<span className="text-sm text-muted-foreground">
					{formatDate(report.createdAt)}
				</span>
			</header>
			<dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
				<dt className="font-medium">{t("Grund")}</dt>
				<dd>
					{report.reason}
					{report.note ? ` – ${report.note}` : ""}
				</dd>
				<dt className="font-medium">
					{report.kind === "message"
						? t("Meldungen zum Inserat")
						: t("Meldungen")}
				</dt>
				<dd>{report.reportCount}</dd>
				<dt className="font-medium">{t("Gemeldet von")}</dt>
				<dd>{report.reporterEmail ?? t("Unbekannt")}</dd>
				<dt className="font-medium">{t("Inserent")}</dt>
				<dd>{report.post.posterEmail ?? t("Unbekannt")}</dd>
				<dt className="font-medium">{t("Inserat")}</dt>
				<dd>
					{gone ? `${t("Inserat gelöscht")}: ` : ""}
					{report.post.title}
				</dd>
				{listingFacts(report.post, locale).map((fact) => (
					<Fragment key={fact.label}>
						<dt className="font-medium">{fact.label}</dt>
						<dd className="whitespace-pre-wrap break-words">{fact.value}</dd>
					</Fragment>
				))}
				{report.decision && (
					<>
						<dt className="font-medium">{t("Entscheidung")}</dt>
						<dd>
							{t(decisionLabel(report.decision, report.kind))}
							{report.decidedAt ? ` · ${formatDate(report.decidedAt)}` : ""}
						</dd>
					</>
				)}
				{report.decisionReason && (
					<>
						<dt className="font-medium">{t("Begründung der Entscheidung")}</dt>
						<dd className="whitespace-pre-wrap">{report.decisionReason}</dd>
					</>
				)}
			</dl>
			<p className="whitespace-pre-wrap text-sm">{report.post.description}</p>
			{report.message && (
				<blockquote className="border-l-2 pl-3 text-sm">
					<p className="whitespace-pre-wrap">{report.message.body}</p>
					<footer className="text-muted-foreground">
						{report.message.senderEmail ?? t("Unbekannt")}
					</footer>
				</blockquote>
			)}
			{error && (
				<p role="alert" className="error-banner">
					{t(error)}
				</p>
			)}
			{canDecide && (
				<div className="space-y-3">
					{copy.hint && (
						<p className="text-sm text-muted-foreground">
							{t(copy.hint)}{" "}
							<Link to={ROUTES.MARKETPLACE_BLOCKS} preload={false}>
								{t("Zum Sperrformular")}
							</Link>
						</p>
					)}
					{removing && (
						<div className="space-y-2">
							<Label htmlFor={`reason-${report.id}`}>
								{t("Begründung (3–500 Zeichen)")}
							</Label>
							<textarea
								id={`reason-${report.id}`}
								className="min-h-20 w-full rounded-hc-sm border border-hc-text-muted bg-background p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
								minLength={3}
								maxLength={500}
								value={reason}
								onChange={(e) => setReason(e.target.value)}
							/>
						</div>
					)}
					<div className="flex flex-wrap gap-2">
						<Button
							size="sm"
							variant="outline"
							disabled={pending}
							onClick={() => decide("dismiss")}
						>
							{t("Verwerfen")}
						</Button>
						{removing ? (
							<Button
								size="sm"
								variant="destructive"
								disabled={pending || reason.trim().length < 3}
								onClick={() => decide("remove")}
							>
								{t(copy.confirm)}
							</Button>
						) : (
							<Button
								size="sm"
								variant="destructive"
								disabled={pending}
								onClick={() => setRemoving(true)}
							>
								{t(copy.action)}
							</Button>
						)}
					</div>
				</div>
			)}
		</article>
	);
}
