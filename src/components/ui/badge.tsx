import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "#/lib/utils";

const badgeVariants = cva(
	"inline-flex max-w-full items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-hc-accent-soft text-primary dark:text-hc-primary-1",
				outline: "border-border/50 bg-card text-foreground",
				muted: "border-border/40 bg-muted/50 text-muted-foreground",
				secondary: "border-border/40 bg-muted/50 text-muted-foreground",
				destructive:
					"border-hc-danger/30 bg-[color-mix(in_oklab,var(--hc-danger)_10%,var(--card))] text-hc-danger",
				success:
					"border-hc-success/30 bg-[color-mix(in_oklab,var(--hc-success)_6%,var(--card))] text-hc-success",
				warning:
					"border-hc-warning/30 bg-[color-mix(in_oklab,var(--hc-warning)_6%,var(--card))] text-hc-warning",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<span className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
