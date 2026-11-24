import { z } from "zod";
import { type Locale, translate } from "#/lib/i18n";

const uuid = z
	.string()
	.regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
const reason = z.string().trim().min(3).max(500);

/** Mirrors the backend: a reason (3-500 chars) is required only for `remove`. */
export const decisionInputSchema = z
	.object({
		id: uuid,
		action: z.enum(["dismiss", "remove"]),
		reason: z.string().trim().max(500).optional(),
	})
	.superRefine((value, ctx) => {
		if (value.action === "remove" && !reasonOk(value.reason))
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["reason"],
				message: "reason required",
			});
	});
function reasonOk(value: string | undefined) {
	return reason.safeParse(value).success;
}

export const blockInputSchema = z.object({
	userEmail: z
		.string()
		.trim()
		.toLowerCase()
		.max(254)
		.regex(/^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$/),
	reason,
	days: z.number().int().min(1).max(365),
});
export const reportStatusSchema = z.object({
	status: z.enum(["open", "decided"]),
});
export const liftBlockSchema = z.object({ id: uuid });
export const postViewSchema = z.enum(["live", "hidden", "all"]);
export const postFilterSchema = z.object({
	view: postViewSchema,
	q: z.string().trim().max(100).optional(),
});
export const removePostSchema = z.object({ id: uuid, reason });
export const restorePostSchema = z.object({ id: uuid });
export type PostView = z.infer<typeof postViewSchema>;
export type PostFilter = z.infer<typeof postFilterSchema>;
export type RemovePostInput = z.infer<typeof removePostSchema>;

export type DecisionInput = z.infer<typeof decisionInputSchema>;
export type BlockInput = z.infer<typeof blockInputSchema>;

/** German source strings; translate with t() at the call site. */
export function marketplaceErrorMessage(
	error: unknown,
	context: "decide" | "lift" | "block" | "post" = "decide",
): string {
	const code = error instanceof Error ? error.message : "";
	if (code === "Conflict")
		return context === "post"
			? "Das Inserat wurde inzwischen geändert. Bitte neu laden."
			: "Bereits entschieden.";
	if (code === "MarketplaceUnavailable")
		return "Der Marktplatz ist auf diesem Server nicht eingerichtet.";
	if (code === "NotFound" && context === "lift")
		return "Sperre nicht gefunden oder bereits aufgehoben.";
	return "Die Aktion ist fehlgeschlagen. Bitte lade die Seite neu.";
}

/**
 * Button and hint copy for deciding a report (German source strings).
 * A message report's "remove" only marks the report decided; the message itself
 * is not deleted, so it is labelled as handled and points to the block form.
 */
export function decisionCopy(kind: "post" | "message"): {
	action: string;
	confirm: string;
	hint: string | null;
} {
	return kind === "message"
		? {
				action: "Erledigt",
				confirm: "Als erledigt markieren",
				hint: "Die Nachricht wird dadurch nicht gelöscht. Um die absendende Person zu sperren, nutze das Sperrformular.",
			}
		: { action: "Entfernen", confirm: "Entfernen bestätigen", hint: null };
}

const postStatusLabels: Record<string, string> = {
	active: "Sichtbar",
	reserved: "Reserviert",
	closed: "Geschlossen",
	expired: "Abgelaufen",
	removedByOwner: "Von der Person gelöscht",
	removedByModerator: "Von der Moderation entfernt",
	hiddenPendingReview: "Ausgeblendet bis zur Prüfung",
	hiddenByBlock: "Ausgeblendet (Konto gesperrt)",
};
/** German source label for a post status; unknown values are shown as-is. */
export function postStatusLabel(status: string): string {
	return postStatusLabels[status] ?? status;
}
/** Which moderator action fits a post's status. */
export function postActions(status: string): {
	remove: boolean;
	restore: boolean;
} {
	return {
		remove: status !== "removedByModerator" && status !== "removedByOwner",
		restore: status === "removedByModerator",
	};
}

/** Outcome shown in the decided list (German source string). */
export function decisionLabel(
	decision: string | null,
	kind: "post" | "message",
): string {
	if (decision === "dismissed") return "Verworfen";
	if (decision === "removed")
		return kind === "message" ? "Als erledigt markiert" : "Entfernt";
	return "Unbekannt";
}

const categoryLabels: Record<string, string> = {
	housing: "Unterkunft",
	jobs: "Jobs",
};
/** German source labels per detail key; also fixes the display order. */
const detailLabels: Record<string, string> = {
	employer: "Arbeitgeber",
	jobType: "Art der Stelle",
	workMode: "Arbeitsmodell",
	languages: "Sprachen",
	weeklyHours: "Wochenstunden",
	requirements: "Anforderungen",
	applyMethod: "Bewerbung per",
	applyUrl: "Bewerbungslink",
	applyEmail: "Bewerbungs-E-Mail",
	applyDeadline: "Bewerbungsfrist",
	contactName: "Ansprechperson",
	contactRole: "Funktion",
	contactEmail: "Kontakt-E-Mail",
	companyWebsite: "Webseite des Unternehmens",
	skills: "Fähigkeiten",
	portfolioUrl: "Portfolio-Link",
	housingType: "Art der Unterkunft",
	rentalDuration: "Mietdauer",
	deposit: "Kaution",
	rentIncludes: "Miete enthält",
	sizeSqm: "Größe (m²)",
	rooms: "Zimmer",
	furnished: "Möbliert",
	facilities: "Ausstattung",
	occupation: "Tätigkeit",
};

/**
 * Category and listing details as plain "label: value" rows for moderators.
 * Values are user content: render as text only, never as HTML or links.
 * Option values stay raw (e.g. "workingStudent"); unknown keys are shown as-is.
 */
export function listingFacts(
	post: {
		category?: string | null;
		details?: Record<string, string | number | string[]> | null;
	},
	language: Locale = "de",
): { label: string; value: string }[] {
	const rows: { label: string; value: string }[] = [];
	if (post.category)
		rows.push({
			label: translate("Kategorie", language),
			value: translate(
				categoryLabels[post.category] ?? post.category,
				language,
			),
		});
	const details = post.details ?? {};
	const known = Object.keys(detailLabels).filter((key) => key in details);
	const unknown = Object.keys(details).filter((key) => !(key in detailLabels));
	for (const key of [...known, ...unknown]) {
		const raw = details[key];
		const value = Array.isArray(raw)
			? raw.map(String).join(", ")
			: String(raw ?? "");
		if (value === "") continue;
		rows.push({
			label: translate(detailLabels[key] ?? key, language),
			value,
		});
	}
	return rows;
}
