import { createFileRoute, redirect } from "@tanstack/react-router";
import { HAWConnectMark } from "#/components/brand/hawconnect-mark";
import { LegalFooter } from "#/components/layout/legal-footer";
import { PageShell } from "#/components/layout/page-shell";
import { Button } from "#/components/ui/button";
import { getAuthStatusFn } from "#/lib/auth.functions";
import { legalUrl } from "#/lib/constants";
import { t, useLocale } from "#/lib/i18n";

const ERRORS: Record<string, string> = {
	sso: "Die Anmeldung wurde nicht abgeschlossen. Bitte versuche es erneut.",
	"no-access":
		"Dieses Konto hat keinen Zugang zum Dashboard. Bitte wende dich an ein Vorstandsmitglied.",
};

export const Route = createFileRoute("/login")({
	validateSearch: (search: Record<string, unknown>): { error?: string } =>
		typeof search.error === "string" ? { error: search.error } : {},
	beforeLoad: async () => {
		const status = await getAuthStatusFn();
		if (status.user) throw redirect({ to: "/" });
		return status;
	},
	component: LoginPage,
});

function LoginPage() {
	useLocale();
	const { error } = Route.useSearch();
	const message = error ? ERRORS[error] : undefined;

	return (
		<PageShell>
			<div className="flex min-h-0 w-full min-w-0 flex-1 lg:grid lg:grid-cols-2">
				<div
					aria-hidden
					className="relative m-3 hidden overflow-hidden rounded-hc-card lg:flex lg:items-center lg:justify-center"
					style={{ backgroundImage: "var(--hc-gradient)" }}
				>
					<HAWConnectMark
						aria-hidden
						role="presentation"
						className="h-56 w-auto text-white/25"
					/>
					<div className="absolute -right-24 -bottom-24 size-72 rounded-full bg-hc-accent/20 blur-3xl" />
				</div>
				<div className="flex w-full min-w-0 flex-1 items-center justify-center p-4">
					<section className="panel w-full max-w-[25rem]">
						<div className="mb-5 flex items-center gap-2.5 text-lg font-bold text-primary">
							<HAWConnectMark className="h-7 w-auto shrink-0" />
							HAWConnect
						</div>
						<h1 className="text-[26px] font-bold leading-tight">
							HAWConnect Console
						</h1>
						<p className="mt-2 text-[15px] text-muted-foreground">
							{t("Inhalte und Dienste der HAWConnect-App verwalten.")}
						</p>
						{message && (
							<p role="alert" className="error-banner mt-5">
								{t(message)}
							</p>
						)}
						<Button asChild size="lg" className="mt-6 w-full">
							{/* A full page load: the server route sends the browser to the login site. */}
							<a href="/auth/start">{t("Melde dich an, um fortzufahren")}</a>
						</Button>
						<p className="mt-4 text-[13px] text-muted-foreground">
							<Consent />
						</p>
					</section>
				</div>
			</div>
			<LegalFooter />
		</PageShell>
	);
}

/** "By continuing, you agree to our Terms of Service and Privacy Policy." with links. */
function Consent() {
	const locale = useLocale();
	const link = (href: string, text: string) => (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="rounded-hc-xs font-medium text-primary underline underline-offset-2 hover:text-hc-primary-hover"
		>
			{t(text)}
		</a>
	);
	// One sentence per language, so word order stays natural.
	const [before, middle, after] = t(
		"Wenn du fortfährst, stimmst du unseren {terms} und der {privacy} zu.",
	).split(/\{terms\}|\{privacy\}/);
	return (
		<>
			{before}
			{link(legalUrl(locale, "terms"), "Nutzungsbedingungen")}
			{middle}
			{link(legalUrl(locale, "privacy"), "Datenschutzerklärung")}
			{after}
		</>
	);
}
