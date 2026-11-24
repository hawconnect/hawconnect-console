import { describe, expect, test } from "bun:test";
import { featureItems } from "#/components/layout/nav-items";
import { ROUTES } from "./constants";
import { translate } from "./i18n";
import {
	blockInputSchema,
	decisionCopy,
	decisionInputSchema,
	decisionLabel,
	listingFacts,
	marketplaceErrorMessage,
	postActions,
	postFilterSchema,
	postStatusLabel,
	removePostSchema,
} from "./schemas/marketplace";

const id = "123e4567-e89b-42d3-a456-426614174000";

describe("decisionInputSchema", () => {
	test("accepts dismiss without a reason and remove with a reason", () => {
		expect(
			decisionInputSchema.safeParse({ id, action: "dismiss" }).success,
		).toBe(true);
		const r = decisionInputSchema.parse({
			id,
			action: "remove",
			reason: "  Spam post  ",
		});
		expect(r.reason).toBe("Spam post");
	});
	test("rejects empty, short, blank or overlong reasons on remove", () => {
		for (const reason of [undefined, "", "   ", "ab", "x".repeat(501)])
			expect(
				decisionInputSchema.safeParse({ id, action: "remove", reason }).success,
			).toBe(false);
	});
	test("rejects unknown actions and malformed ids", () => {
		expect(
			decisionInputSchema.safeParse({ id, action: "ban", reason: "abc" })
				.success,
		).toBe(false);
		expect(
			decisionInputSchema.safeParse({ id: "nope", action: "dismiss" }).success,
		).toBe(false);
	});
});

describe("blockInputSchema", () => {
	const ok = {
		userEmail: "student@haw-hamburg.de",
		reason: "Repeated scams",
		days: 30,
	};
	test("accepts valid input and normalises the email", () => {
		const r = blockInputSchema.parse({
			...ok,
			userEmail: "  Student@HAW-Hamburg.DE ",
		});
		expect(r.userEmail).toBe("student@haw-hamburg.de");
	});
	test("rejects days outside 1-365 and non-integers", () => {
		for (const days of [0, -1, 366, 1.5, Number.NaN])
			expect(blockInputSchema.safeParse({ ...ok, days }).success).toBe(false);
		for (const days of [1, 365])
			expect(blockInputSchema.safeParse({ ...ok, days }).success).toBe(true);
	});
	test("rejects short reasons and malformed emails, accepts any domain", () => {
		expect(blockInputSchema.safeParse({ ...ok, reason: "ab" }).success).toBe(
			false,
		);
		expect(
			blockInputSchema.safeParse({ ...ok, userEmail: "Guest@Example.com" }).data
				?.userEmail,
		).toBe("guest@example.com");
		for (const userEmail of ["@haw-hamburg.de", "a@localhost", "a b@x.de"])
			expect(blockInputSchema.safeParse({ ...ok, userEmail }).success).toBe(
				false,
			);
	});
});

describe("marketplaceErrorMessage", () => {
	test("maps backend codes to German source strings", () => {
		expect(marketplaceErrorMessage(Error("Conflict"))).toBe(
			"Bereits entschieden.",
		);
		expect(marketplaceErrorMessage(Error("MarketplaceUnavailable"))).toBe(
			"Der Marktplatz ist auf diesem Server nicht eingerichtet.",
		);
		expect(marketplaceErrorMessage(Error("NotFound"), "lift")).toBe(
			"Sperre nicht gefunden oder bereits aufgehoben.",
		);
		expect(marketplaceErrorMessage(Error("boom"))).toBe(
			"Die Aktion ist fehlgeschlagen. Bitte lade die Seite neu.",
		);
	});
});

test("NotFound only reads as a lifted block when lifting", () => {
	expect(marketplaceErrorMessage(Error("NotFound"), "decide")).toBe(
		"Die Aktion ist fehlgeschlagen. Bitte lade die Seite neu.",
	);
});

describe("decisionCopy", () => {
	test("message reports are marked handled, not removed, and point to the block form", () => {
		const copy = decisionCopy("message");
		expect(copy.action).toBe("Erledigt");
		expect(translate(copy.action, "en")).toBe("Mark as handled");
		expect(copy.confirm).not.toContain("Entfernen");
		expect(copy.hint).toContain("Sperr");
		for (const text of [copy.confirm, copy.hint ?? ""])
			expect(translate(text, "en")).not.toBe(text);
	});
	test("post reports keep the removal wording", () => {
		expect(decisionCopy("post")).toEqual({
			action: "Entfernen",
			confirm: "Entfernen bestätigen",
			hint: null,
		});
	});
});

describe("decisionLabel", () => {
	test("names the outcome per kind, translated", () => {
		expect(decisionLabel("removed", "post")).toBe("Entfernt");
		expect(decisionLabel("removed", "message")).toBe("Als erledigt markiert");
		expect(decisionLabel("dismissed", "post")).toBe("Verworfen");
		for (const label of [
			"Entfernt",
			"Verworfen",
			"Als erledigt markiert",
			"Entscheidung",
		])
			expect(translate(label, "en")).not.toBe(label);
	});
});

test("marketplace navigation never preloads (loading it writes identity audit rows)", () => {
	const item = featureItems.find((i) => i.to === ROUTES.MARKETPLACE);
	expect(item?.preload).toBe(false);
});

describe("report view shows the listing category and details", () => {
	const post = {
		category: "jobs",
		details: {
			employer: "Acme <b>GmbH</b>",
			jobType: "workingStudent",
			languages: ["english", "german"],
			weeklyHours: 20,
			applyUrl: "https://example.com/apply",
		},
	};
	test("lists the category and each detail as label: value (English)", () => {
		expect(listingFacts(post, "en")).toEqual([
			{ label: "Category", value: "Jobs" },
			{ label: "Employer", value: "Acme <b>GmbH</b>" },
			{ label: "Job type", value: "workingStudent" },
			{ label: "Languages", value: "english, german" },
			{ label: "Hours per week", value: "20" },
			{ label: "Application link", value: "https://example.com/apply" },
		]);
	});
	test("uses German labels and tolerates missing category and details", () => {
		expect(listingFacts({ category: "jobs", details: {} }, "de")).toEqual([
			{ label: "Kategorie", value: "Jobs" },
		]);
		expect(listingFacts({ category: null, details: {} }, "en")).toEqual([]);
		expect(listingFacts({ category: "housing" }, "en")[0]?.value).toBe(
			"Accommodation",
		);
	});
	test("labels exist for contact and website keys", () => {
		for (const key of [
			"Ansprechperson",
			"Funktion",
			"Kontakt-E-Mail",
			"Webseite des Unternehmens",
		])
			expect(translate(key, "en")).not.toBe(key);
	});
	test("every category and detail key has an English label", () => {
		for (const key of [
			"Unterkunft",
			"Arbeitgeber",
			"Art der Stelle",
			"Arbeitsmodell",
			"Sprachen",
			"Wochenstunden",
			"Anforderungen",
			"Bewerbung per",
			"Bewerbungslink",
			"Bewerbungs-E-Mail",
			"Bewerbungsfrist",
			"Fähigkeiten",
			"Portfolio-Link",
			"Art der Unterkunft",
			"Mietdauer",
			"Kaution",
			"Miete enthält",
			"Größe (m²)",
			"Zimmer",
			"Möbliert",
			"Ausstattung",
			"Tätigkeit",
		])
			expect(translate(key, "en")).not.toBe(key);
	});
});

describe("marketplace listings", () => {
	const id = "00000000-0000-4000-8000-000000000001";
	test("offers remove for live or hidden posts and restore only after a moderator removal", () => {
		expect(postActions("active")).toEqual({ remove: true, restore: false });
		expect(postActions("hiddenPendingReview")).toEqual({
			remove: true,
			restore: false,
		});
		expect(postActions("removedByModerator")).toEqual({
			remove: false,
			restore: true,
		});
		expect(postActions("removedByOwner")).toEqual({
			remove: false,
			restore: false,
		});
	});
	test("labels every post status in both languages", () => {
		for (const status of [
			"active",
			"reserved",
			"closed",
			"expired",
			"removedByOwner",
			"removedByModerator",
			"hiddenPendingReview",
			"hiddenByBlock",
		]) {
			const label = postStatusLabel(status);
			expect(label).not.toBe(status);
			expect(translate(label, "en")).not.toBe(label);
		}
		expect(postStatusLabel("somethingNew")).toBe("somethingNew");
	});
	test("requires a 3-500 character reason to remove and a known view", () => {
		expect(removePostSchema.safeParse({ id, reason: "ok" }).success).toBe(
			false,
		);
		expect(removePostSchema.safeParse({ id, reason: "Spam" }).success).toBe(
			true,
		);
		expect(postFilterSchema.safeParse({ view: "live" }).success).toBe(true);
		expect(postFilterSchema.safeParse({ view: "other" }).success).toBe(false);
	});
	test("explains a post that changed meanwhile", () => {
		expect(marketplaceErrorMessage(new Error("Conflict"), "post")).toContain(
			"geändert",
		);
	});
});
