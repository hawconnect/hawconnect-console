import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "#/lib/utils";

const buttonVariants = cva(
	"inline-flex max-w-full min-w-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-hc-sm text-sm font-semibold transition-[color,background-color,border-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-hc-primary-hover",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-destructive/90",
				outline:
					"border border-border bg-card text-foreground hover:bg-muted aria-pressed:border-primary aria-pressed:bg-hc-primary-0 aria-pressed:text-primary dark:aria-pressed:bg-hc-primary-9 dark:aria-pressed:text-hc-primary-2",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-hc-primary-1 dark:hover:bg-hc-primary-8",
				ghost: "text-foreground hover:bg-muted",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-[42px] px-4 py-2",
				sm: "h-9 px-3 text-xs",
				lg: "h-[46px] px-5",
				icon: "h-[42px] w-[42px] [&_svg]:size-5",
				"icon-sm": "h-9 w-9 px-0 [&_svg]:size-5",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
