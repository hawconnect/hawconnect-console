import { describe, expect, test } from "bun:test";
import { type AttentionInput, attentionItems } from "../attention";
import { translate } from "../i18n";

const now = new Date("2026-11-17T12:00:00Z");
const empty: AttentionInput = {
	now,
	marketplace: null,
	announcements: null,
	services: null,
};

describe("today's attention list", () => {
	test("is empty when nothing needs a look", () => {
		expect(
			attentionItems({
				...empty,
				marketplace: { open: 0, oldestAt: null },
				services: [
					{ name: "HAW News", available: true, stale: false, updatedAt: null },
				],
			}),
		).toEqual([]);
	});

	test("lists open reports first, with the oldest one's date", () => {
		const items = attentionItems({
			...empty,
			services: [
				{
					name: "Speiseplan",
					available: true,
					stale: true,
					updatedAt: "2026-11-17T06:00:00Z",
				},
			],
			marketplace: { open: 3, oldestAt: "2026-11-15T12:00:00Z" },
		});
		expect(items.map((i) => i.key)).toEqual([
			"marketplace",
			"source-Speiseplan",
		]);
		expect(items[0]).toMatchObject({
			tone: "danger",
			params: { count: 3 },
			dates: { oldest: "2026-11-15T12:00:00Z" },
			href: "/marketplace",
		});
		expect(
			attentionItems({
				...empty,
				marketplace: { open: 1, oldestAt: null },
			})[0].title,
		).toBe("1 offene Meldung im Marktplatz");
	});

	test("flags only running announcements that end within 48 hours", () => {
		const items = attentionItems({
			...empty,
			announcements: [
				{
					id: "soon",
					title: "Semesterstart",
					startDateTime: "2026-11-10T00:00:00Z",
					endDateTime: "2026-11-18T12:00:00Z",
				},
				{
					id: "later",
					title: "Later",
					startDateTime: "2026-11-10T00:00:00Z",
					endDateTime: "2026-11-25T00:00:00Z",
				},
				{
					id: "not-started",
					title: "Upcoming",
					startDateTime: "2026-11-18T00:00:00Z",
					endDateTime: "2026-11-18T06:00:00Z",
				},
				{
					id: "past",
					title: "Past",
					startDateTime: "2026-11-01T00:00:00Z",
					endDateTime: "2026-11-16T00:00:00Z",
				},
			],
		});
		expect(items).toHaveLength(1);
		expect(items[0]).toMatchObject({
			params: { title: "Semesterstart" },
			hrefParams: { id: "soon" },
		});
	});

	test("treats an unavailable source as a problem, a stale one as a warning", () => {
		const items = attentionItems({
			...empty,
			services: [
				{ name: "HAW Events", available: true, stale: true, updatedAt: null },
				{ name: "HAW News", available: false, stale: true, updatedAt: null },
			],
		});
		expect(items.map((i) => [i.params.name, i.tone])).toEqual([
			["HAW News", "danger"],
			["HAW Events", "warning"],
		]);
	});

	test("every text has an English translation", () => {
		const items = attentionItems({
			now,
			marketplace: { open: 2, oldestAt: "2026-11-15T12:00:00Z" },
			services: [
				{
					name: "HAW News",
					available: false,
					stale: true,
					updatedAt: "2026-11-15T12:00:00Z",
				},
				{ name: "HAW Events", available: true, stale: true, updatedAt: null },
			],
			announcements: [
				{
					id: "a",
					title: "A",
					startDateTime: "2026-11-10T00:00:00Z",
					endDateTime: "2026-11-18T00:00:00Z",
				},
			],
		});
		for (const item of items)
			for (const text of [item.title, item.detail, item.action].filter(Boolean))
				expect(translate(text, "en")).not.toBe(text);
	});
});
