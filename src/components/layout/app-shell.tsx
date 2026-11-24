import { IconMenu2 } from "@tabler/icons-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { HAWConnectMark } from "#/components/brand/hawconnect-mark";
import { AppSidebar } from "#/components/layout/app-sidebar";
import { LegalFooter } from "#/components/layout/legal-footer";
import { MobileNavSheet } from "#/components/layout/mobile-nav-sheet";
import { Button } from "#/components/ui/button";
import { APP_NAME } from "#/lib/constants";
import { t, useLocale } from "#/lib/i18n";
import { readSidebarCollapsed, writeSidebarCollapsed } from "#/lib/sidebar";
import { cn } from "#/lib/utils";

export function AppShell({
	children,
	mainClassName,
}: {
	children: ReactNode;
	mainClassName?: string;
}) {
	useLocale();

	const [mobileOpen, setMobileOpen] = useState(false);
	const [collapsed, setCollapsed] = useState(false);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		setCollapsed(readSidebarCollapsed());
		setReady(true);
	}, []);

	function handleCollapsedChange(next: boolean) {
		setCollapsed(next);
		writeSidebarCollapsed(next);
	}

	const handleToggleSidebar = useCallback(() => {
		const isDesktop = window.matchMedia("(min-width: 768px)").matches;
		if (isDesktop) {
			setCollapsed((prev) => {
				const next = !prev;
				writeSidebarCollapsed(next);
				return next;
			});
			return;
		}
		setMobileOpen((prev) => !prev);
	}, []);

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
				e.preventDefault();
				handleToggleSidebar();
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [handleToggleSidebar]);

	return (
		<div className="relative flex min-h-screen w-full min-w-0 bg-background">
			<div
				data-app-sidebar-shell
				className={cn(
					"sticky top-0 hidden h-svh shrink-0 py-3 pl-3 md:block",
					ready && "transition-[width] duration-200 ease-out",
					collapsed ? "w-[5.5rem]" : "w-[17.75rem]",
				)}
			>
				<AppSidebar
					collapsed={collapsed}
					onCollapsedChange={handleCollapsedChange}
				/>
			</div>

			<MobileNavSheet open={mobileOpen} onOpenChange={setMobileOpen} />

			<div className="flex min-h-screen min-w-0 flex-1 flex-col">
				<header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur md:hidden">
					<Button
						type="button"
						variant="outline"
						size="icon-sm"
						aria-label={t("Menü öffnen")}
						aria-expanded={mobileOpen}
						aria-haspopup="dialog"
						onClick={() => setMobileOpen(true)}
					>
						<IconMenu2 stroke={1.75} aria-hidden />
					</Button>
					<HAWConnectMark className="h-6 w-auto text-primary" />
					<span className="text-sm font-semibold">{APP_NAME}</span>
				</header>

				<main
					className={cn(
						"page-gutter mx-auto w-full min-w-0 max-w-6xl flex-1 py-6 sm:py-8 md:p-8 md:pt-8",
						mainClassName,
					)}
				>
					{children}
				</main>

				<LegalFooter />
			</div>
		</div>
	);
}
