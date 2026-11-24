import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PRIMARY_SCALE, RADIUS, TOKENS, type TokenName } from "../tokens";

const css = readFileSync(join(import.meta.dir, "../../styles.css"), "utf8");

function block(selector: string): string {
	const start = css.indexOf(`${selector} {`);
	if (start === -1) throw new Error(`missing selector ${selector}`);
	const open = css.indexOf("{", start);
	let depth = 0;
	for (let i = open; i < css.length; i++) {
		if (css[i] === "{") depth++;
		if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
	}
	throw new Error(`unterminated ${selector}`);
}

const light = block(":root");
const darkSystem = block(":root:not([data-theme])");
const darkToggle = block(':root[data-theme="dark"]');
const names = Object.keys(TOKENS.light) as TokenName[];

test("token values match the spec", () => {
	expect(TOKENS.light.primary).toBe("#40296C");
	expect(TOKENS.dark.primary).toBe("#AC97D3");
	expect(TOKENS.light["text-muted"]).toBe("#646B78");
	expect(PRIMARY_SCALE).toEqual([
		"#F4F1F9",
		"#E5DFF1",
		"#CBBFE4",
		"#AC97D3",
		"#8C70C2",
		"#6F4CB3",
		"#593D8F",
		"#473173",
		"#40296C",
		"#211438",
	]);
	expect(RADIUS.card).toBe("12px");
});

test("light tokens and the primary scale are in the light :root block", () => {
	for (const name of names) {
		expect(light).toContain(`--hc-${name}: ${TOKENS.light[name]};`);
	}
	PRIMARY_SCALE.forEach((value, i) => {
		expect(light).toContain(`--hc-primary-${i}: ${value};`);
	});
});

test("every dark token is defined in both dark selectors", () => {
	for (const dark of [darkSystem, darkToggle]) {
		for (const name of names) {
			expect(dark).toContain(`--hc-${name}: ${TOKENS.dark[name]};`);
		}
		expect(dark).toContain("--primary-foreground: var(--hc-primary-9);");
	}
});

test("legacy blue is gone and the font is Outfit", () => {
	expect(css).not.toMatch(/#007aff|#0e83fd/i);
	expect(css).toMatch(/--font-sans:\s*"Outfit"/);
});

test("status tokens use the amended AA values", () => {
	expect(TOKENS.light.success).toBe("#15803D");
	expect(TOKENS.light.warning).toBe("#B45309");
	expect(TOKENS.light.danger).toBe("#B91C1C");
	expect(TOKENS.dark.success).toBe("#4ADE80");
	expect(TOKENS.dark.warning).toBe("#D97706");
	expect(TOKENS.dark.danger).toBe("#F87171");
});

function sourceFiles(dir: string): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...sourceFiles(full));
		else if (entry.name !== "routeTree.gen.ts") out.push(full);
	}
	return out;
}

const srcFiles = sourceFiles(join(import.meta.dir, "../.."))
	.filter((f) => !f.endsWith("tokens.test.ts"))
	.map((f) => ({ f, text: readFileSync(f, "utf8") }));

test("no legacy blue hex or Tailwind blue/sky/indigo/cyan classes in src", () => {
	const hex = /#007aff|#0e83fd/i;
	const cls =
		/\b(?:bg|text|from|to|via|border|ring|shadow|fill|stroke|outline|divide|decoration|accent|caret|placeholder)-(?:blue|sky|indigo|cyan)-\d{2,3}/;
	const bad = srcFiles.filter(({ text }) => hex.test(text) || cls.test(text));
	expect(bad.map((b) => b.f)).toEqual([]);
});

test("status colours use tokens, not amber/emerald classes", () => {
	const bad = srcFiles.filter(({ text }) =>
		/\b(?:amber|emerald|red|green|yellow|orange|rose|lime)-\d/.test(text),
	);
	expect(bad.map((b) => b.f)).toEqual([]);
});

test("dark: variant follows the console theme, with OS fallback only when no data-theme is set", () => {
	const start = css.indexOf("@custom-variant dark {");
	expect(start).toBeGreaterThan(-1);
	const open = css.indexOf("{", start);
	let depth = 0;
	let end = open;
	for (let i = open; i < css.length; i++) {
		if (css[i] === "{") depth++;
		if (css[i] === "}" && --depth === 0) {
			end = i;
			break;
		}
	}
	const variant = css.slice(open, end);
	expect(variant).toContain('[data-theme="dark"]');
	expect(variant).toContain("@media (prefers-color-scheme: dark)");
	expect(variant).toContain(":root:not([data-theme])");
	expect(variant.match(/@slot/g)?.length).toBe(2);
});
