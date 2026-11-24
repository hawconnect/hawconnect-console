import {
	IconCircleCheck,
	IconCircleX,
	IconClock,
	type TablerIcon,
} from "@tabler/icons-react";

export const announcementStatus = {
	active: "Aktiv",
	upcoming: "Anstehend",
	past: "Abgelaufen",
} as const;

export type AnnouncementStatus = keyof typeof announcementStatus;

export function getAnnouncementStatus(announcement: {
	startDateTime: Date | string;
	endDateTime: Date | string;
}): AnnouncementStatus {
	const startDate = new Date(announcement.startDateTime);
	const endDate = new Date(announcement.endDateTime);
	const now = new Date();

	if (now < startDate) return "upcoming";
	if (now > endDate) return "past";
	return "active";
}

const statusMeta: Record<
	AnnouncementStatus,
	{ icon: TablerIcon; className: string }
> = {
	active: {
		icon: IconCircleCheck,
		className: "text-hc-success",
	},
	upcoming: {
		icon: IconClock,
		className: "text-hc-warning",
	},
	past: {
		icon: IconCircleX,
		className: "text-hc-danger",
	},
};

export function getAnnouncementStatusMeta(status: AnnouncementStatus) {
	return statusMeta[status];
}
