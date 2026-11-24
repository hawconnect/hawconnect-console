import { useEffect, useSyncExternalStore } from "react";
import messages from "./translations.json";
export type Locale = "de" | "en";
export const LOCALE_STORAGE_KEY = "hawconnect-console-locale";
const key = LOCALE_STORAGE_KEY;
let locale: Locale = "de";
const listeners = new Set<() => void>();
export function translate(text: string, language: Locale = locale): string {
	return language === "en"
		? ((messages as Record<string, string>)[text] ?? text)
		: text;
}
export const t = translate;
export function setLocale(value: Locale) {
	if (value !== "de" && value !== "en") return;
	locale = value;
	try {
		localStorage.setItem(key, value);
	} catch {
		/* Storage may be disabled. */
	}
	document.documentElement.lang = value;
	document.dispatchEvent(new Event("hawconnect:theme-hydrate"));
	for (const listener of listeners) listener();
}
const subscribe = (listener: () => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};
export function useLocale() {
	const value = useSyncExternalStore(
		subscribe,
		() => locale,
		() => "de" as Locale,
	);
	useEffect(() => {
		try {
			const saved = localStorage.getItem(key);
			if (saved === "de" || saved === "en") {
				if (saved !== locale) setLocale(saved);
			}
		} catch {
			/* Storage may be disabled. */
		}
		const sync = (event: StorageEvent) => {
			if (
				event.key === key &&
				(event.newValue === "de" || event.newValue === "en")
			)
				setLocale(event.newValue);
		};
		window.addEventListener("storage", sync);
		return () => window.removeEventListener("storage", sync);
	}, []);
	return value;
}
export function formatDate(value: string | Date) {
	return new Date(value).toLocaleString(locale === "en" ? "en-GB" : "de-DE");
}
/** Translate, then fill `{name}` slots. */
export function tf(
	text: string,
	params: Record<string, string | number> = {},
): string {
	return Object.entries(params).reduce(
		(out, [name, value]) => out.replaceAll(`{${name}}`, String(value)),
		translate(text),
	);
}
const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	["day", 86400000],
	["hour", 3600000],
	["minute", 60000],
];
/** "vor 2 Tagen" / "in 3 hours"; under a minute counts as now. */
export function formatRelative(value: string | Date, now = new Date()) {
	const diff = new Date(value).getTime() - now.getTime();
	const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
	for (const [unit, ms] of RELATIVE_UNITS)
		if (Math.abs(diff) >= ms) return format.format(Math.round(diff / ms), unit);
	return format.format(0, "minute");
}
