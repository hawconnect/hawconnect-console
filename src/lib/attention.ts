/**
 * What the "Today" page asks the team to look at. Pure, so it is tested
 * without a server. Text is German source copy; params fill `{name}` slots
 * after translation.
 */

export type AttentionTone = "danger" | "warning";

export type AttentionItem = {
	key: string;
	tone: AttentionTone;
	icon: "reports" | "announcement" | "source";
	title: string;
	detail: string;
	params: Record<string, string | number>;
	/** Dates are formatted by the page in the reader's language. */
	dates?: Record<string, string>;
	href: string;
	hrefParams?: Record<string, string>;
	action: string;
};

export type AttentionInput = {
	now: Date;
	marketplace: { open: number; oldestAt: string | null } | null;
	announcements:
		| {
				id: string;
				title: string;
				startDateTime: string;
				endDateTime: string;
		  }[]
		| null;
	services:
		| {
				name: string;
				available: boolean;
				stale: boolean;
				updatedAt: string | null;
		  }[]
		| null;
};

/** Announcements ending within this window are flagged. */
export const ENDING_SOON_MS = 48 * 60 * 60 * 1000;

export function attentionItems(input: AttentionInput): AttentionItem[] {
	const items: AttentionItem[] = [];
	const now = input.now.getTime();

	if (input.marketplace && input.marketplace.open > 0) {
		const { open, oldestAt } = input.marketplace;
		items.push({
			key: "marketplace",
			tone: "danger",
			icon: "reports",
			title:
				open === 1
					? "1 offene Meldung im Marktplatz"
					: "{count} offene Meldungen im Marktplatz",
			detail: oldestAt ? "Älteste Meldung: {oldest}" : "",
			params: { count: open },
			dates: oldestAt ? { oldest: oldestAt } : undefined,
			href: "/marketplace",
			action: "Prüfen",
		});
	}

	for (const service of input.services ?? []) {
		if (service.available && !service.stale) continue;
		items.push({
			key: `source-${service.name}`,
			tone: service.available ? "warning" : "danger",
			icon: "source",
			title: service.available
				? "{name} ist veraltet"
				: "{name} ist nicht verfügbar",
			detail: service.updatedAt
				? "Letzte Aktualisierung: {updated}"
				: "Noch nicht aktualisiert",
			params: { name: service.name },
			dates: service.updatedAt ? { updated: service.updatedAt } : undefined,
			href: "/operations",
			action: "Ansehen",
		});
	}

	for (const row of input.announcements ?? []) {
		const start = Date.parse(row.startDateTime);
		const end = Date.parse(row.endDateTime);
		if (!(start <= now && now <= end && end - now <= ENDING_SOON_MS)) continue;
		items.push({
			key: `announcement-${row.id}`,
			tone: "warning",
			icon: "announcement",
			title: "„{title}“ endet bald",
			detail: "Endet am {end}",
			params: { title: row.title },
			dates: { end: row.endDateTime },
			href: "/announcements/$id",
			hrefParams: { id: row.id },
			action: "Öffnen",
		});
	}

	// Problems first, then things that only need a look.
	return items.sort(
		(a, b) => Number(b.tone === "danger") - Number(a.tone === "danger"),
	);
}
