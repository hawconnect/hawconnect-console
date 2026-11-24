import { setLocale, useLocale } from "#/lib/i18n";
export function LanguageSwitch({ compact = false }: { compact?: boolean }) {
	const locale = useLocale();
	return (
		<label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
			<span className="sr-only">
				{locale === "en" ? "Language" : "Sprache"}
			</span>
			<select
				aria-label={locale === "en" ? "Language" : "Sprache"}
				className="h-9 cursor-pointer rounded-hc-sm border border-hc-text-muted bg-card px-2.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
				value={locale}
				onChange={(event) => setLocale(event.target.value as "de" | "en")}
			>
				<option value="de">{compact ? "DE" : "Deutsch"}</option>
				<option value="en">{compact ? "EN" : "English"}</option>
			</select>
		</label>
	);
}
