import { legalUrl } from "#/lib/constants";
import { t, useLocale } from "#/lib/i18n";
import { cn } from "#/lib/utils";
import { LanguageSwitch } from "./language-switch";
export function LegalFooter({ className }: { className?: string }) {
	const locale = useLocale();

	return (
		<footer
			className={cn(
				"page-gutter w-full py-6 text-center text-xs text-muted-foreground",
				className,
			)}
		>
			<div className="mb-3">
				<LanguageSwitch />
			</div>
			<nav className="flex justify-center gap-4" aria-label={t("Rechtliches")}>
				<a href={legalUrl(locale, "imprint")}>{t("Impressum")}</a>
				<a href={legalUrl(locale, "privacy")}>{t("Datenschutz")}</a>
			</nav>
		</footer>
	);
}
