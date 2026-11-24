import type { TablerIcon } from "@tabler/icons-react";
import {
	IconActivity,
	IconBuildingStore,
	IconCalendarEvent,
	IconDoor,
	IconHistory,
	IconInbox,
	IconSpeakerphone,
	IconUser,
	IconUsers,
	IconWorld,
} from "@tabler/icons-react";
import {
	type AppCapability,
	canAccessAnnouncements,
	canAccessAudit,
	canAccessMarketplace,
	canAccessOps,
} from "#/lib/auth";
import { ROUTES } from "#/lib/constants";

export type NavGroup = "publish" | "community" | "setup" | "system";

/** Sidebar groups, in order, named by the job they serve. */
export const NAV_GROUPS: { id: NavGroup; label: string }[] = [
	{ id: "publish", label: "Veröffentlichen" },
	{ id: "community", label: "Community" },
	{ id: "setup", label: "App-Einrichtung" },
	{ id: "system", label: "System" },
];

export type NavItem = {
	to: string;
	group?: NavGroup;
	/** A live count or dot from the layout's nav status. */
	badge?: "reports" | "sources";
	label: string;
	icon: TablerIcon;
	match: (pathname: string) => boolean;
	visible: (capabilities: AppCapability[]) => boolean;
	external?: boolean;
	/** false disables hover/intent preloading (e.g. loaders that write audit rows). */
	preload?: false;
};

export const overviewItems: NavItem[] = [
	{
		to: ROUTES.HOME,
		label: "Heute",
		icon: IconInbox,
		match: (pathname) => pathname === ROUTES.HOME,
		visible: () => true,
	},
];

export const featureItems: NavItem[] = [
	{
		to: ROUTES.ANNOUNCEMENTS,
		group: "publish",
		label: "Ankündigungen",
		icon: IconSpeakerphone,
		match: (p) => p.startsWith("/announcements"),
		visible: canAccessAnnouncements,
	},
	{
		to: ROUTES.EVENTS,
		group: "publish",
		label: "Club-Veranstaltungen",
		icon: IconCalendarEvent,
		match: (p) => p.startsWith("/events"),
		visible: (c) => c.includes("admin") || c.includes("events"),
	},
	{
		to: ROUTES.CLUBS,
		group: "publish",
		label: "Clubs",
		icon: IconUsers,
		match: (p) => p.startsWith("/clubs"),
		visible: canAccessOps,
	},
	{
		to: ROUTES.ORGANIZERS,
		group: "publish",
		label: "Veranstalterprofile",
		icon: IconUser,
		match: (p) => p.startsWith("/organizers"),
		visible: (c) => c.includes("admin") || c.includes("events"),
	},
	{
		to: ROUTES.MARKETPLACE,
		group: "community",
		label: "Marktplatz",
		icon: IconBuildingStore,
		badge: "reports",
		match: (p) => p.startsWith("/marketplace"),
		visible: canAccessMarketplace,
		// The reports loader writes one identity-audit row per report; only load on a real visit.
		preload: false,
	},
	{
		to: "/quick-links",
		group: "setup",
		label: "Quick Links",
		icon: IconWorld,
		match: (p) => p.startsWith("/quick-links"),
		visible: canAccessOps,
	},
	{
		to: ROUTES.OPERATIONS,
		group: "system",
		label: "Datenquellen",
		icon: IconActivity,
		badge: "sources",
		match: (p) => p.startsWith("/operations"),
		visible: canAccessOps,
	},
	{
		to: ROUTES.PERMISSIONS,
		group: "system",
		label: "Berechtigungen",
		icon: IconDoor,
		match: (p) => p.startsWith("/permissions"),
		visible: (c) => c.includes("admin"),
	},
	{
		to: ROUTES.AUDIT_LOG,
		group: "system",
		label: "Audit-Log",
		icon: IconHistory,
		match: (p) => p.startsWith(ROUTES.AUDIT_LOG),
		visible: canAccessAudit,
	},
];

export const externalAdminLinks: NavItem[] = [];

export function navItemsForCapabilities(
	items: NavItem[],
	capabilities: AppCapability[],
): NavItem[] {
	return items.filter((item) => item.visible(capabilities));
}

/** The feature links a user may see, grouped by job; empty groups are left out. */
export function groupedNavItems(capabilities: AppCapability[]) {
	const visible = navItemsForCapabilities(featureItems, capabilities);
	return NAV_GROUPS.map((group) => ({
		...group,
		items: visible.filter((item) => item.group === group.id),
	})).filter((group) => group.items.length > 0);
}
