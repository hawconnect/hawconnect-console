import {
	createFileRoute,
	Link,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { PageHeader } from "#/components/layout/page-header";
import { MarketplaceSubNav } from "#/components/marketplace/sub-nav";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { ROUTES } from "#/lib/constants";
import { formatDate, t, useLocale } from "#/lib/i18n";
import {
	listMarketPostsFn,
	type MarketPost,
	removeMarketPostFn,
	restoreMarketPostFn,
} from "#/lib/marketplace.functions";
import { requireMarketplaceUser } from "#/lib/require-app-user";
import {
	listingFacts,
	marketplaceErrorMessage,
	type PostView,
	postActions,
	postStatusLabel,
} from "#/lib/schemas/marketplace";

const VIEWS: { value: PostView; label: string }[] = [
	{ value: "live", label: "Sichtbar" },
	{ value: "hidden", label: "Ausgeblendet" },
	{ value: "all", label: "Alle" },
];

export const Route = createFileRoute("/_app/marketplace/posts")({
	validateSearch: (
		search: Record<string, unknown>,
	): { view: PostView; q?: string } => {
		const view = VIEWS.some((v) => v.value === search.view)
			? (search.view as PostView)
			: "live";
		const q =
			typeof search.q === "string" && search.q.trim()
				? search.q.trim().slice(0, 100)
				: undefined;
		return q ? { view, q } : { view };
	},
	beforeLoad: ({ context }) => {
		requireMarketplaceUser(context.user);
	},
	loaderDeps: ({ search }) => ({ view: search.view, q: search.q }),
	loader: ({ deps }) =>
		listMarketPostsFn({ data: { view: deps.view, q: deps.q } }),
	component: MarketplacePosts,
});

function MarketplacePosts() {
	useLocale();
	const { view, q } = Route.useSearch();
	const { items } = Route.useLoaderData();
	const navigate = useNavigate();
	const [search, setSearch] = useState(q ?? "");
	const [notice, setNotice] = useState("");
	return (
		<>
			<PageHeader
				title={t("Marktplatz-Inserate")}
				lead={t("Alle Inserate ansehen, entfernen oder wiederherstellen.")}
				end={<MarketplaceSubNav current="posts" />}
			/>
			<div className="flex flex-wrap items-end gap-3">
				<div className="flex gap-2">
					{VIEWS.map((option) => (
						<Button
							asChild
							key={option.value}
							size="sm"
							variant={view === option.value ? "default" : "outline"}
						>
							<Link
								to={ROUTES.MARKETPLACE_POSTS}
								search={q ? { view: option.value, q } : { view: option.value }}
								preload={false}
							>
								{t(option.label)}
							</Link>
						</Button>
					))}
				</div>
				<form
					className="flex min-w-0 flex-1 gap-2 sm:max-w-md"
					onSubmit={(e) => {
						e.preventDefault();
						const text = search.trim();
						navigate({
							to: ROUTES.MARKETPLACE_POSTS,
							search: text ? { view, q: text } : { view },
						});
					}}
				>
					<Label htmlFor="post-search" className="sr-only">
						{t("Inserate durchsuchen")}
					</Label>
					<Input
						id="post-search"
						type="search"
						maxLength={100}
						placeholder={t("Titel, Text oder E-Mail")}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					<Button type="submit" size="sm" variant="outline">
						{t("Suchen")}
					</Button>
				</form>
			</div>
			{notice && (
				<p role="status" className="panel">
					{t(notice)}
				</p>
			)}
			<div className="space-y-4">
				{items.map((post) => (
					<PostCard key={post.id} post={post} onNotice={setNotice} />
				))}
				{!items.length && (
					<p className="panel">
						{t(
							q
								? "Keine Inserate gefunden."
								: "Keine Inserate in dieser Ansicht.",
						)}
					</p>
				)}
			</div>
			{items.length === 100 && (
				<p className="text-sm text-muted-foreground">
					{t(
						"Es werden die 100 neuesten Inserate gezeigt. Nutze die Suche, um ältere zu finden.",
					)}
				</p>
			)}
		</>
	);
}

function price(post: MarketPost): string | null {
	if (post.priceFree) return t("Kostenlos");
	if (post.priceEur === null) return null;
	const unit =
		post.priceUnit === "perMonth"
			? ` ${t("pro Monat")}`
			: post.priceUnit === "perHour"
				? ` ${t("pro Stunde")}`
				: "";
	return `${post.priceEur} €${unit}`;
}

function PostCard({
	post,
	onNotice,
}: {
	post: MarketPost;
	onNotice: (message: string) => void;
}) {
	const locale = useLocale();
	const router = useRouter();
	const [removing, setRemoving] = useState(false);
	const [reason, setReason] = useState("");
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);
	const actions = postActions(post.status);
	const visible = post.status === "active" || post.status === "reserved";
	const shownPrice = price(post);
	const run = async (work: () => Promise<void>) => {
		setPending(true);
		setError("");
		onNotice("");
		try {
			await work();
			await router.invalidate();
		} catch (e) {
			setError(marketplaceErrorMessage(e, "post"));
		} finally {
			setPending(false);
		}
	};
	const remove = () =>
		run(async () => {
			const result = await removeMarketPostFn({
				data: { id: post.id, reason: reason.trim() },
			});
			setRemoving(false);
			setReason("");
			if (!result.mailSent)
				onNotice("Die Person konnte nicht per E-Mail benachrichtigt werden.");
		});
	const restore = () =>
		run(async () => {
			await restoreMarketPostFn({ data: { id: post.id } });
		});
	return (
		<article className="panel space-y-3">
			<header className="flex flex-wrap items-start justify-between gap-2">
				<div className="min-w-0">
					<h2 className="break-words text-lg font-semibold">{post.title}</h2>
					<p className="text-sm text-muted-foreground">
						{post.type === "offer" ? t("Angebot") : t("Gesuch")} ·{" "}
						{formatDate(post.createdAt)}
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					{post.reportCount > 0 && (
						<Badge variant="destructive">
							{t("Meldungen")}: {post.reportCount}
						</Badge>
					)}
					<Badge variant={visible ? "default" : "muted"}>
						{t(postStatusLabel(post.status))}
					</Badge>
				</div>
			</header>
			<dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
				<dt className="font-medium">{t("Inserent")}</dt>
				<dd className="break-words">{post.posterEmail ?? t("Unbekannt")}</dd>
				{shownPrice && (
					<>
						<dt className="font-medium">{t("Preis")}</dt>
						<dd>{shownPrice}</dd>
					</>
				)}
				{post.location && (
					<>
						<dt className="font-medium">{t("Ort")}</dt>
						<dd className="break-words">{post.location}</dd>
					</>
				)}
				<dt className="font-medium">{t("Läuft ab")}</dt>
				<dd>{formatDate(post.expiresAt)}</dd>
				{listingFacts(post, locale).map((fact) => (
					<Fragment key={fact.label}>
						<dt className="font-medium">{fact.label}</dt>
						<dd className="whitespace-pre-wrap break-words">{fact.value}</dd>
					</Fragment>
				))}
			</dl>
			<p className="whitespace-pre-wrap break-words text-sm">
				{post.description}
			</p>
			{error && (
				<p role="alert" className="error-banner">
					{t(error)}
				</p>
			)}
			{removing && (
				<div className="space-y-2">
					<Label htmlFor={`remove-reason-${post.id}`}>
						{t("Begründung (3–500 Zeichen)")}
					</Label>
					<textarea
						id={`remove-reason-${post.id}`}
						className="min-h-20 w-full rounded-hc-sm border border-hc-text-muted bg-background p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
						minLength={3}
						maxLength={500}
						value={reason}
						onChange={(e) => setReason(e.target.value)}
					/>
					<p className="text-sm text-muted-foreground">
						{t("Die Person erhält die Begründung per E-Mail.")}
					</p>
				</div>
			)}
			{(actions.remove || actions.restore) && (
				<div className="flex flex-wrap gap-2">
					{actions.remove &&
						(removing ? (
							<>
								<Button
									size="sm"
									variant="outline"
									disabled={pending}
									onClick={() => {
										setRemoving(false);
										setReason("");
									}}
								>
									{t("Abbrechen")}
								</Button>
								<Button
									size="sm"
									variant="destructive"
									disabled={pending || reason.trim().length < 3}
									onClick={remove}
								>
									{t("Entfernen bestätigen")}
								</Button>
							</>
						) : (
							<Button
								size="sm"
								variant="destructive"
								disabled={pending}
								onClick={() => setRemoving(true)}
							>
								{t("Entfernen")}
							</Button>
						))}
					{actions.restore && (
						<Button
							size="sm"
							variant="outline"
							disabled={pending}
							onClick={restore}
						>
							{t("Wiederherstellen")}
						</Button>
					)}
				</div>
			)}
		</article>
	);
}
