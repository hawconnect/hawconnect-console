import { z } from "zod";

const safeUrl = z
	.string()
	.max(2048)
	.nullable()
	.refine((value) => {
		if (!value) return true;
		try {
			const url = new URL(value);
			return url.protocol === "https:" && !url.username && !url.password;
		} catch {
			return false;
		}
	}, "Bitte eine HTTPS-Adresse ohne Zugangsdaten verwenden.");

export const announcementSchema = z.object({
	id: z.string(),
	version: z.string().optional(),
	title: z.object({
		de: z
			.string({ required_error: "Bitte einen Titel eingeben." })
			.trim()
			.min(1, "Bitte einen Titel eingeben."),
		en: z
			.string({ required_error: "Bitte einen Titel eingeben." })
			.trim()
			.min(1, "Bitte einen Titel eingeben."),
	}),
	description: z.object({
		de: z
			.string({
				required_error: "Bitte eine Beschreibung eingeben.",
				invalid_type_error: "Bitte eine Beschreibung eingeben.",
			})
			.trim()
			.min(1, "Bitte eine Beschreibung eingeben."),
		en: z
			.string({
				required_error: "Bitte eine Beschreibung eingeben.",
				invalid_type_error: "Bitte eine Beschreibung eingeben.",
			})
			.trim()
			.min(1, "Bitte eine Beschreibung eingeben."),
	}),
	startDateTime: z.preprocess(
		(val) => {
			if (typeof val === "string" || val instanceof Date) {
				return new Date(val);
			}
		},
		z.date({
			required_error: "Bitte eine Startzeit angeben.",
		}),
	),
	endDateTime: z.preprocess(
		(val) => {
			if (typeof val === "string" || val instanceof Date) {
				return new Date(val);
			}
		},
		z.date({
			required_error: "Bitte eine Endzeit angeben.",
		}),
	),
	priority: z
		.number({
			required_error: "Bitte eine Priorität zwischen 0 und 100 angeben.",
			invalid_type_error: "Bitte eine Priorität zwischen 0 und 100 angeben.",
		})
		.int()
		.min(0)
		.max(100)
		.default(0),
	url: safeUrl,
	platform: z.enum(["WEB", "IOS", "ANDROID"]).array().min(1, {
		message: "Bitte mindestens eine Plattform auswählen.",
	}),
	userKind: z.enum(["STUDENT", "EMPLOYEE", "GUEST"]).array().min(1, {
		message: "Bitte mindestens eine Benutzergruppe auswählen.",
	}),
	imageUrl: safeUrl,
});

export const updateAnnouncementSchema = announcementSchema;

export const newAnnouncementSchema = updateAnnouncementSchema
	.omit({
		id: true,
	})
	.refine((value) => value.endDateTime >= value.startDateTime, {
		message: "Das Ende muss nach dem Beginn liegen.",
		path: ["endDateTime"],
	});

export type Announcement = z.infer<typeof announcementSchema>;
export type UpdateAnnouncement = z.infer<typeof updateAnnouncementSchema>;
export type NewAnnouncement = z.infer<typeof newAnnouncementSchema>;
