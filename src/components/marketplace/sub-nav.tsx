import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { ROUTES } from "#/lib/constants";
import { t, useLocale } from "#/lib/i18n";

export function MarketplaceSubNav({
	current,
}: {
	current: "reports" | "posts" | "blocks";
}) {
	useLocale();
	return (
		<nav className="flex gap-2" aria-label={t("Marktplatz-Moderation")}>
			<Button
				asChild
				size="sm"
				variant={current === "reports" ? "default" : "outline"}
			>
				<Link
					to={ROUTES.MARKETPLACE}
					search={{ status: "open" }}
					preload={false}
				>
					{t("Meldungen")}
				</Link>
			</Button>
			<Button
				asChild
				size="sm"
				variant={current === "posts" ? "default" : "outline"}
			>
				<Link
					to={ROUTES.MARKETPLACE_POSTS}
					search={{ view: "live" }}
					preload={false}
				>
					{t("Inserate")}
				</Link>
			</Button>
			<Button
				asChild
				size="sm"
				variant={current === "blocks" ? "default" : "outline"}
			>
				<Link to={ROUTES.MARKETPLACE_BLOCKS} preload={false}>
					{t("Sperren")}
				</Link>
			</Button>
		</nav>
	);
}
