import * as React from "react";
import { cn } from "#/lib/utils";

const PICKER_TYPES = new Set([
	"date",
	"datetime-local",
	"month",
	"time",
	"week",
]);

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
	({ className, type = "text", ...props }, ref) => {
		const isPicker = PICKER_TYPES.has(type);
		const isFile = type === "file";

		return (
			<input
				type={type}
				className={cn(
					"flex h-[42px] w-full min-w-0 rounded-hc-sm border border-hc-text-muted bg-input px-3 py-2 font-sans text-sm text-foreground transition-colors placeholder:text-hc-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
					isPicker && "native-picker",
					isFile &&
						"cursor-pointer file:mr-3 file:cursor-pointer file:border-0 file:rounded-hc-xs file:bg-card file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";

export { Input };
