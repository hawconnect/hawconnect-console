import * as React from "react";
import { cn } from "#/lib/utils";

/** Shared field chrome for raw native controls (textarea, select) that mirror <Input>. */
export const nativeFieldClass =
	"w-full rounded-hc-sm border border-hc-text-muted bg-input px-3 py-2 font-sans text-sm text-foreground transition-colors placeholder:text-hc-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

export const nativeSelectClass = cn(nativeFieldClass, "h-[42px]");

const Textarea = React.forwardRef<
	HTMLTextAreaElement,
	React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
	<textarea
		className={cn("flex min-h-24", nativeFieldClass, className)}
		ref={ref}
		{...props}
	/>
));
Textarea.displayName = "Textarea";

export { Textarea };
