import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "#/components/layout/page-header";
import { MarketplaceSubNav } from "#/components/marketplace/sub-nav";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { formatDate, t, useLocale } from "#/lib/i18n";
import {
	createMarketBlockFn,
	liftMarketBlockFn,
	listMarketBlocksFn,
} from "#/lib/marketplace.functions";
import { requireMarketplaceUser } from "#/lib/require-app-user";
import {
	blockInputSchema,
	marketplaceErrorMessage,
} from "#/lib/schemas/marketplace";

export const Route = createFileRoute("/_app/marketplace/blocks")({
	beforeLoad: ({ context }) => {
		requireMarketplaceUser(context.user);
	},
	loader: () => listMarketBlocksFn(),
	component: MarketplaceBlocks,
});

function MarketplaceBlocks() {
	useLocale();
	const { items } = Route.useLoaderData();
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [reason, setReason] = useState("");
	const [days, setDays] = useState("30");
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [pending, setPending] = useState(false);
	return (
		<>
			<PageHeader
				title={t("Marktplatz-Sperren")}
				lead={t("Konten vorübergehend vom Marktplatz sperren.")}
				end={<MarketplaceSubNav current="blocks" />}
			/>
			<form
				className="panel space-y-4"
				onSubmit={async (e) => {
					e.preventDefault();
					setError("");
					setNotice("");
					const parsed = blockInputSchema.safeParse({
						userEmail: email,
						reason,
						days: Number(days),
					});
					if (!parsed.success) {
						setError(
							"Bitte eine gültige E-Mail-Adresse, eine Begründung (3–500 Zeichen) und 1–365 Tage angeben.",
						);
						return;
					}
					setPending(true);
					try {
						const result = await createMarketBlockFn({ data: parsed.data });
						if (!result.mailSent)
							setNotice(
								"Die Person konnte nicht per E-Mail benachrichtigt werden.",
							);
						setEmail("");
						setReason("");
						await router.invalidate();
					} catch (err) {
						setError(marketplaceErrorMessage(err, "block"));
					} finally {
						setPending(false);
					}
				}}
			>
				<h2 className="text-xl font-semibold">{t("Konto sperren")}</h2>
				<Label htmlFor="block-email">{t("E-Mail-Adresse des Kontos")}</Label>
				<Input
					id="block-email"
					type="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<Label htmlFor="block-reason">{t("Begründung (3–500 Zeichen)")}</Label>
				<textarea
					id="block-reason"
					required
					minLength={3}
					maxLength={500}
					className="min-h-20 w-full rounded-hc-sm border border-hc-text-muted bg-background p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
					value={reason}
					onChange={(e) => setReason(e.target.value)}
				/>
				<Label htmlFor="block-days">{t("Dauer in Tagen (1–365)")}</Label>
				<Input
					id="block-days"
					type="number"
					required
					min={1}
					max={365}
					step={1}
					value={days}
					onChange={(e) => setDays(e.target.value)}
				/>
				{error && (
					<p role="alert" className="error-banner">
						{t(error)}
					</p>
				)}
				{notice && <p role="status">{t(notice)}</p>}
				<Button disabled={pending}>{t("Konto sperren")}</Button>
			</form>
			<section className="panel overflow-x-auto">
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="border-b">
							<th className="py-3">{t("Begründung")}</th>
							<th>{t("Bis")}</th>
							<th>{t("Gesperrt von")}</th>
							<th>{t("Aktionen")}</th>
						</tr>
					</thead>
					<tbody>
						{items.map((block) => (
							<BlockRow key={block.id} block={block} />
						))}
						{!items.length && (
							<tr>
								<td className="py-3" colSpan={4}>
									{t("Keine Sperren.")}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</section>
		</>
	);
}

function BlockRow({
	block,
}: {
	block: {
		id: string;
		reason: string;
		until: string;
		createdBy: string;
		liftedAt: string | null;
	};
}) {
	const router = useRouter();
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);
	const active = !block.liftedAt && new Date(block.until) > new Date();
	return (
		<tr className="border-b align-top">
			<td className="py-3">{block.reason}</td>
			<td>{formatDate(block.until)}</td>
			<td>{block.createdBy}</td>
			<td>
				{block.liftedAt ? (
					t("Aufgehoben")
				) : (
					<>
						<Button
							size="sm"
							variant="outline"
							disabled={pending}
							onClick={async () => {
								setPending(true);
								setError("");
								try {
									await liftMarketBlockFn({ data: { id: block.id } });
									await router.invalidate();
								} catch (err) {
									setError(marketplaceErrorMessage(err, "lift"));
								} finally {
									setPending(false);
								}
							}}
						>
							{active ? t("Aufheben") : t("Abgelaufen – aufheben")}
						</Button>
						{error && (
							<p role="alert" className="error-banner mt-2">
								{t(error)}
							</p>
						)}
					</>
				)}
			</td>
		</tr>
	);
}
