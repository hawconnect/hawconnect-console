export const PRIMARY_SCALE = [
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
] as const satisfies readonly string[];

export type TokenName =
	| "primary"
	| "primary-hover"
	| "secondary"
	| "accent"
	| "accent-soft"
	| "page"
	| "surface"
	| "border"
	| "text"
	| "text-muted"
	| "text-tertiary"
	| "success"
	| "warning"
	| "danger";

export const TOKENS: {
	light: Record<TokenName, string>;
	dark: Record<TokenName, string>;
} = {
	light: {
		primary: "#40296C",
		"primary-hover": "#473173",
		secondary: "#3D0B44",
		accent: "#E44689",
		"accent-soft": "rgba(228, 70, 137, 0.12)",
		page: "#F7F6F8",
		surface: "#FFFFFF",
		border: "rgba(0, 0, 0, 0.08)",
		text: "#211438",
		"text-muted": "#646B78",
		"text-tertiary": "#9CA3AF",
		success: "#15803D",
		warning: "#B45309",
		danger: "#B91C1C",
	},
	dark: {
		primary: "#AC97D3",
		"primary-hover": "#CBBFE4",
		secondary: "#3D0B44",
		accent: "#E44689",
		"accent-soft": "rgba(228, 70, 137, 0.18)",
		page: "#141019",
		surface: "#1D1726",
		border: "rgba(255, 255, 255, 0.08)",
		text: "#F4F1F9",
		"text-muted": "#A39CB0",
		"text-tertiary": "#7A7387",
		success: "#4ADE80",
		warning: "#D97706",
		danger: "#F87171",
	},
};

export const RADIUS = {
	xs: "3px",
	sm: "5px",
	md: "7px",
	lg: "10px",
	xl: "15px",
	card: "12px",
} as const;

export const GRADIENT = "linear-gradient(135deg, #40296C, #593D8F)";
