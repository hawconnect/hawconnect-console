import { IconLogout } from "@tabler/icons-react";
import { getRouteApi, Link, useRouterState } from "@tanstack/react-router";
import { HAWConnectMark } from "#/components/brand/hawconnect-mark";
import {
	externalAdminLinks,
	groupedNavItems,
	type NavItem,
	navItemsForCapabilities,
	overviewItems,
} from "#/components/layout/nav-items";
import { ThemeToggle } from "#/components/layout/theme-toggle";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "#/components/ui/sheet";
import { APP_NAME, ROUTES } from "#/lib/constants";
import type { NavStatus } from "#/lib/dashboard.functions";
import { t, useLocale } from "#/lib/i18n";
import { cn } from "#/lib/utils";
import { LanguageSwitch } from "./language-switch";
import { NavBadge } from "./nav-badge";

const appRouteApi = getRouteApi("/_app");

function MobileNavSection({
	title,
	items,
	pathname,
	onNavigate,
	hideTitle = false,
	status,
}: {
	title: string;
	items: NavItem[];
	pathname: string;
	onNavigate: () => void;
	hideTitle?: boolean;
	status?: NavStatus;
}) {
	useLocale();

	return (
		<div className="flex flex-col gap-1">
			{hideTitle ? (
				<span className="sr-only">{t(title)}</span>
			) : (
				<p className="px-3 pb-1 text-[13px] text-muted-foreground">
					{t(title)}
				</p>
			)}
			{items.map((item) => {
				const Icon = item.icon;
				const active = item.match(pathname);
				const className = cn(
					"relative flex items-center gap-3 rounded-hc-md px-3 py-3 text-sm no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
					active
						? "bg-accent font-semibold text-primary"
						: "text-foreground hover:bg-muted",
				);
				const content = (
					<>
						<Icon className="size-4 shrink-0" stroke={1.75} aria-hidden />
						<span className="min-w-0 flex-1 truncate">{t(item.label)}</span>
						<NavBadge item={item} status={status} />
					</>
				);

				if (item.external) {
					return (
						<a
							key={item.to}
							href={item.to}
							target="_blank"
							rel="noopener noreferrer"
							onClick={onNavigate}
							className={className}
						>
							{content}
						</a>
					);
				}

				return (
					<Link
						key={item.to}
						to={item.to}
						preload={item.preload}
						onClick={onNavigate}
						className={className}
						aria-current={active ? "page" : undefined}
					>
						{content}
					</Link>
				);
			})}
		</div>
	);
}

export function MobileNavSheet({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	useLocale();

	const { user } = appRouteApi.useRouteContext();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const groups = groupedNavItems(user.capabilities);
	const status = appRouteApi.useLoaderData();
	const external = navItemsForCapabilities(
		externalAdminLinks,
		user.capabilities,
	);

	function close() {
		onOpenChange(false);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="bottom"
				showClose
				className="max-h-[85dvh] gap-0 overflow-hidden p-0 md:hidden"
			>
				<div
					aria-hidden
					className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-border"
				/>
				<SheetHeader className="border-b border-border px-4 py-4 pr-12">
					<div className="flex items-center gap-3">
						<HAWConnectMark className="h-7 w-auto shrink-0 text-primary" />
						<div className="min-w-0">
							<SheetTitle>{APP_NAME}</SheetTitle>
							<SheetDescription className="sr-only">
								Navigation
							</SheetDescription>
						</div>
					</div>
				</SheetHeader>

				<nav
					className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4"
					aria-label={t("Hauptnavigation")}
				>
					<MobileNavSection
						title={t("Übersicht")}
						items={overviewItems}
						pathname={pathname}
						onNavigate={close}
						hideTitle
					/>
					{groups.map((group) => (
						<MobileNavSection
							key={group.id}
							title={t(group.label)}
							items={group.items}
							pathname={pathname}
							onNavigate={close}
							status={status}
						/>
					))}
					{external.length > 0 ? (
						<MobileNavSection
							title={t("Extern")}
							items={external}
							pathname={pathname}
							onNavigate={close}
						/>
					) : null}
				</nav>

				<div className="space-y-3 border-t border-border p-4">
					<div className="flex min-w-0 items-center gap-3">
						<div className="flex size-9 shrink-0 items-center justify-center bg-primary/10 text-xs font-semibold text-primary">
							{(user.name || user.email)
								.trim()
								.split(/\s+/)
								.filter(Boolean)
								.slice(0, 2)
								.map((part) => part[0]?.toUpperCase() ?? "")
								.join("") || "?"}
						</div>
						<div className="min-w-0 leading-tight">
							<p className="truncate text-sm font-semibold text-foreground">
								{user.name || user.email}
							</p>
							{user.name && user.email ? (
								<p className="truncate text-xs text-muted-foreground">
									{user.email}
								</p>
							) : null}
						</div>
					</div>
					<div className="flex items-center justify-between">
						<LanguageSwitch />
						<ThemeToggle variant="outline" size="icon-sm" />
						<form action={ROUTES.AUTH_LOGOUT} method="post">
							<button
								type="submit"
								className="inline-flex h-9 items-center gap-2 px-3 text-sm text-muted-foreground no-underline hover:text-foreground"
							>
								<IconLogout stroke={1.75} className="size-4" aria-hidden />
								{t("Abmelden")}
							</button>
						</form>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
