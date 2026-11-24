import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "#/components/layout/page-header";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { t, useLocale } from "#/lib/i18n";
import { getPermissionsFn, setPermissionsFn } from "#/lib/operations.functions";

const options = [
	["announcements", "Ankündigungen"],
	["events", "Veranstaltungen"],
	["ops", "Datenquellen"],
	["marketplace", "Marktplatz"],
	["audit", "Audit-Log"],
	["admin", "Administration"],
];
export const Route = createFileRoute("/_app/permissions")({
	loader: () => getPermissionsFn(),
	component: Permissions,
});
function Permissions() {
	useLocale();

	const rows = Route.useLoaderData();
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [roles, setRoles] = useState<string[]>([]);
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);
	return (
		<>
			<PageHeader
				title={t("Berechtigungen")}
				lead={t(
					"Lege fest, wer welche Bereiche des Dashboards verwalten darf. Jedes Konto mit bestätigter E-Mail-Adresse kann freigeschaltet werden.",
				)}
			/>
			<form
				className="panel space-y-4"
				onSubmit={async (e) => {
					e.preventDefault();
					if (
						!window.confirm(
							t("Berechtigungen für {email} speichern?").replace(
								"{email}",
								email,
							),
						)
					)
						return;
					setPending(true);
					setError("");
					try {
						await setPermissionsFn({ data: { email, capabilities: roles } });
						await router.invalidate();
						setEmail("");
						setRoles([]);
					} catch {
						setError(
							"Änderung fehlgeschlagen. Super-Admins lassen sich hier nicht ändern.",
						);
					} finally {
						setPending(false);
					}
				}}
			>
				<Label htmlFor="admin-email">{t("E-Mail-Adresse")}</Label>
				<Input
					id="admin-email"
					type="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<div className="flex flex-wrap gap-5">
					{options.map(([key, title]) => (
						<Label key={key} className="flex items-center gap-2">
							<Checkbox
								checked={roles.includes(key)}
								onCheckedChange={(checked) =>
									setRoles(
										checked ? [...roles, key] : roles.filter((r) => r !== key),
									)
								}
							/>
							{t(title)}
						</Label>
					))}
				</div>
				<p className="text-sm text-muted-foreground">
					{t(
						"Ohne ausgewählte Berechtigung wird der delegierte Zugang entzogen. Super-Admins lassen sich hier nicht ändern.",
					)}
				</p>
				{error && (
					<p role="alert" className="error-banner">
						{t(error)}
					</p>
				)}
				<Button disabled={pending}>{t("Berechtigungen speichern")}</Button>
			</form>
			<section className="panel overflow-x-auto">
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="border-b">
							<th className="py-3">{t("Konto")}</th>
							<th>{t("Rollen")}</th>
							<th>{t("Zugang")}</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => (
							<tr className="border-b" key={row.email}>
								<td className="py-3">{row.email}</td>
								<td>
									{row.bootstrap
										? t("Super-Admin")
										: row.capabilities.join(", ") || t("Kein Zugang")}
								</td>
								<td>
									{row.bootstrap ? null : (
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setEmail(row.email);
												setRoles(row.capabilities);
											}}
										>
											{t("Bearbeiten")}
										</Button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</section>
		</>
	);
}
