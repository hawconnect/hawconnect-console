export const APP_NAME = "HAWConnect Console" as const;

export const EXTERNAL_LINKS = {
	WEBSITE: "https://www.haw-hamburg.de/",
	ANALYTICS: "",
	STATUS: "",
	CAMPUS_LIFE: "",
} as const;

/** Legal pages are maintained on hawconnect.de and shared by every HAWConnect app. */
export type LegalPage = "privacy" | "imprint" | "terms";
export const legalUrl = (locale: "de" | "en", page: LegalPage) =>
	`https://hawconnect.de/${locale}/legal/${page}`;

export const ROUTES = {
	ORGANIZERS: "/organizers",
	CLUBS: "/clubs",
	HOME: "/",
	EVENTS: "/events",
	MARKETPLACE: "/marketplace",
	MARKETPLACE_BLOCKS: "/marketplace/blocks",
	MARKETPLACE_POSTS: "/marketplace/posts",
	OPERATIONS: "/operations",
	PERMISSIONS: "/permissions",
	LOGIN: "/login",
	NO_ACCESS: "/no-access",
	ANNOUNCEMENTS: "/announcements",
	ANNOUNCEMENTS_NEW: "/announcements/new",
	ROOM_REPORTS: "/roomreports",
	AUDIT_LOG: "/auditlog",
	AUTH_LOGIN: "/api/auth/login",
	AUTH_LOGOUT: "/api/auth/logout",
} as const;
