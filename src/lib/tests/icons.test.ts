import { expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { IconLink } from "@tabler/icons-react";
import { QUICK_LINK_ICON_COMPONENTS, quickLinkIcon } from "../quick-link-icons";

const root = join(import.meta.dir, "..", "..", "..");
const srcDir = join(root, "src");

function sourceFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((entry) => {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) return sourceFiles(path);
		return /\.(ts|tsx)$/.test(entry) ? [path] : [];
	});
}

test("no source file imports the retired icon package", () => {
	const banned = ["lucide", "react"].join("-");
	const offenders = sourceFiles(srcDir)
		.filter((file) => readFileSync(file, "utf8").includes(banned))
		.map((file) => relative(root, file));
	expect(offenders).toEqual([]);
});

test("package.json depends on the pinned Tabler icons only", () => {
	const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
		dependencies: Record<string, string>;
	};
	expect(pkg.dependencies["@tabler/icons-react"]).toBe("3.52.0");
	expect(pkg.dependencies[["lucide", "react"].join("-")]).toBeUndefined();
});

test("every stored Quick Links icon name maps to a Tabler icon", () => {
	const functionsSource = readFileSync(
		join(srcDir, "lib", "quick-links.functions.ts"),
		"utf8",
	);
	const block = functionsSource.match(
		/export const quickLinkIcons = \[([\s\S]*?)\] as const;/,
	);
	expect(block).not.toBeNull();
	const names = [...(block?.[1] ?? "").matchAll(/"([A-Za-z]+)"/g)].map(
		(m) => m[1],
	);
	expect(names).toHaveLength(24);
	for (const name of names) {
		expect(QUICK_LINK_ICON_COMPONENTS).toHaveProperty([name]);
		expect(quickLinkIcon(name)).toBe(
			QUICK_LINK_ICON_COMPONENTS[
				name as keyof typeof QUICK_LINK_ICON_COMPONENTS
			],
		);
	}
});

test("an unknown stored Quick Links icon name falls back to a neutral icon", () => {
	expect(quickLinkIcon("Nope")).toBe(IconLink);
});
