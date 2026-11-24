import { createServerFn } from "@tanstack/react-start";
import { adminRequest } from "#/lib/admin-api";
import {
	type AnnouncementStatus,
	getAnnouncementStatus,
} from "#/lib/announcement-status";
import { getAnnouncements } from "#/lib/announcements.functions";
import type { AttentionInput } from "#/lib/attention";
import { hasCapability } from "#/lib/auth";
import { requireAccessToken } from "#/lib/auth.server";
import type { ServiceStatus } from "#/lib/operations.functions";

export type DashboardSummary = {
	/** ISO time the server built this summary; the page measures "soon" from it. */
	now: string;
	announcements: {
		id: string;
		title: string;
		startDateTime: string;
		endDateTime: string;
		status: AnnouncementStatus;
	}[];
	marketplace: AttentionInput["marketplace"];
	services: ServiceStatus[] | null;
	capabilities: {
		announcements: boolean;
		events: boolean;
		admin: boolean;
	};
	/** True when a section the user may see could not be loaded. */
	partial: boolean;
};

export type NavStatus = {
	openReports: number | null;
	sourcesNeedAttention: boolean;
};

/**
 * One failing source must not take down the whole page: each part resolves
 * to null and marks the summary as partial.
 */
async function optional<T>(
	allowed: boolean,
	load: () => Promise<T>,
	failed: { value: boolean },
): Promise<T | null> {
	if (!allowed) return null;
	try {
		return await load();
	} catch {
		failed.value = true;
		return null;
	}
}

export const getDashboardSummaryFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<DashboardSummary> => {
		const { user, accessToken } = await requireAccessToken();
		const isAdmin = user.capabilities.includes("admin");
		const can = (c: Parameters<typeof hasCapability>[1] | "admin") =>
			c === "admin" ? isAdmin : hasCapability(user.capabilities, c);
		const failed = { value: false };
		const [rows, marketplace, services] = await Promise.all([
			optional(
				can("announcements"),
				() => getAnnouncements(accessToken),
				failed,
			),
			optional(
				can("marketplace"),
				() =>
					adminRequest<{ open: number; oldestAt: string | null }>(
						"/marketplace/reports/summary",
						accessToken,
					),
				failed,
			),
			optional(
				can("ops"),
				() => adminRequest<ServiceStatus[]>("/status", accessToken),
				failed,
			),
		]);
		return {
			now: new Date().toISOString(),
			announcements: (rows ?? [])
				.map((r) => ({
					id: r.id,
					title: r.title.de,
					startDateTime: new Date(r.startDateTime).toISOString(),
					endDateTime: new Date(r.endDateTime).toISOString(),
					status: getAnnouncementStatus(r),
				}))
				.filter((r) => r.status !== "past")
				.sort((a, b) => a.startDateTime.localeCompare(b.startDateTime)),
			marketplace,
			services,
			capabilities: {
				announcements: can("announcements"),
				events: can("events"),
				admin: can("admin"),
			},
			partial: failed.value,
		};
	},
);

/** Small and cheap: the sidebar badge count and data-source dot. */
export const getNavStatusFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<NavStatus> => {
		const { user, accessToken } = await requireAccessToken();
		const failed = { value: false };
		const [marketplace, services] = await Promise.all([
			optional(
				hasCapability(user.capabilities, "marketplace"),
				() =>
					adminRequest<{ open: number }>(
						"/marketplace/reports/summary",
						accessToken,
					),
				failed,
			),
			optional(
				hasCapability(user.capabilities, "ops"),
				() => adminRequest<ServiceStatus[]>("/status", accessToken),
				failed,
			),
		]);
		return {
			openReports: marketplace?.open ?? null,
			sourcesNeedAttention: (services ?? []).some(
				(s) => !s.available || s.stale,
			),
		};
	},
);
