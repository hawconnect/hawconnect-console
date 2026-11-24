import { createFileRoute, redirect } from "@tanstack/react-router";
import { HAWConnectMark } from "#/components/brand/hawconnect-mark";
import { LegalFooter } from "#/components/layout/legal-footer";
import { PageShell } from "#/components/layout/page-shell";
import { Button } from "#/components/ui/button";
import { getAuthStatusFn } from "#/lib/auth.functions";
import { ROUTES } from "#/lib/constants";
import { t, useLocale } from "#/lib/i18n";

export const Route = createFileRoute("/no-access")({
	beforeLoad: async () => {
		const status = await getAuthStatusFn();
		if (!status.user) {
			throw redirect({ to: "/login" });
		}
		return status;
	},
	component: NoAccessPage,
});

function NoAccessPage() {
	useLocale();

	const { user } = Route.useRouteContext();
	const name = user?.name || "du";

	return (
		<PageShell>
			<div className="flex w-full min-w-0 flex-1 items-center justify-center p-4">
				<section className="panel w-full max-w-[25rem]">
					<div className="mb-5 flex items-center gap-2.5 text-lg font-bold text-primary">
						<HAWConnectMark className="h-7 w-auto shrink-0" />
						HAWConnect
					</div>
					<h1 className="text-[26px] font-bold leading-tight">
						{t("Kein Zugriff")}
					</h1>
					<p className="mt-2 text-[15px] text-muted-foreground">
						{t("Hallo")}
						{name}
						{t(
							", dein Konto hat derzeit keinen Zugang zum Dashboard. Bitte wende dich an ein Vorstandsmitglied.",
						)}
					</p>
					<div className="mt-6">
						<Button asChild variant="outline" className="w-full">
							<a href={ROUTES.AUTH_LOGOUT}>{t("Abmelden")}</a>
						</Button>
					</div>
				</section>
			</div>
			<LegalFooter />
		</PageShell>
	);
}
