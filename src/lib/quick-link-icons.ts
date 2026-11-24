import {
	IconBell,
	IconBook,
	IconBooks,
	IconBriefcase,
	IconBuilding,
	IconCalendar,
	IconCode,
	IconCoffee,
	IconDeviceLaptop,
	IconExternalLink,
	IconFileText,
	IconFolderOpen,
	IconHeart,
	IconInfoCircle,
	IconLayoutGrid,
	IconLink,
	IconMail,
	IconMapPin,
	IconMessageCircle,
	IconSchool,
	IconShoppingCart,
	IconUserCircle,
	IconUsers,
	IconWorld,
	type TablerIcon,
} from "@tabler/icons-react";
import type { quickLinkIcons } from "#/lib/quick-links.functions";

export type QuickLinkIconName = (typeof quickLinkIcons)[number];

/**
 * Maps each icon name stored with a Quick Link to its Tabler icon. The stored
 * names are shared with the backend and must not change; only rendering does.
 */
export const QUICK_LINK_ICON_COMPONENTS: Record<QuickLinkIconName, TablerIcon> =
	{
		GraduationCap: IconSchool,
		FolderOpen: IconFolderOpen,
		Library: IconBooks,
		LayoutGrid: IconLayoutGrid,
		FileText: IconFileText,
		Mail: IconMail,
		CircleUser: IconUserCircle,
		Globe: IconWorld,
		ShoppingCart: IconShoppingCart,
		Link: IconLink,
		BookOpen: IconBook,
		Calendar: IconCalendar,
		MapPin: IconMapPin,
		Users: IconUsers,
		Heart: IconHeart,
		Info: IconInfoCircle,
		ExternalLink: IconExternalLink,
		Laptop: IconDeviceLaptop,
		Coffee: IconCoffee,
		Building: IconBuilding,
		Bell: IconBell,
		Briefcase: IconBriefcase,
		Code: IconCode,
		MessageCircle: IconMessageCircle,
	};

/** Returns the icon for a stored name; unknown names get a neutral link icon. */
export function quickLinkIcon(name: string): TablerIcon {
	return Object.hasOwn(QUICK_LINK_ICON_COMPONENTS, name)
		? QUICK_LINK_ICON_COMPONENTS[name as QuickLinkIconName]
		: IconLink;
}
