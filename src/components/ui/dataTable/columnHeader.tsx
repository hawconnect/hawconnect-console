import {
	IconArrowNarrowDown,
	IconArrowNarrowUp,
	IconArrowsSort,
} from "@tabler/icons-react";
import type { Column } from "@tanstack/react-table";
import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdownMenu";
import { t, useLocale } from "#/lib/i18n";
import { cn } from "#/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue>
	extends React.HTMLAttributes<HTMLDivElement> {
	column: Column<TData, TValue>;
	title: string;
}

export function DataTableColumnHeader<TData, TValue>({
	column,
	title,
	className,
}: DataTableColumnHeaderProps<TData, TValue>) {
	useLocale();

	if (!column.getCanSort()) {
		return <div className={cn(className)}>{t(title)}</div>;
	}

	return (
		<div className={cn("flex items-center space-x-2", className)}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="-ml-3 h-8 data-[state=open]:bg-accent"
					>
						<span>{t(title)}</span>
						{column.getIsSorted() === "desc" ? (
							<IconArrowNarrowDown stroke={1.75} className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === "asc" ? (
							<IconArrowNarrowUp stroke={1.75} className="ml-2 h-4 w-4" />
						) : (
							<IconArrowsSort stroke={1.75} className="ml-2 h-4 w-4" />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					<DropdownMenuItem onClick={() => column.toggleSorting(false)}>
						<IconArrowNarrowUp
							stroke={1.75}
							className="mr-2 h-3.5 w-3.5 text-muted-foreground/70"
						/>
						{t("Aufsteigend")}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => column.toggleSorting(true)}>
						<IconArrowNarrowDown
							stroke={1.75}
							className="mr-2 h-3.5 w-3.5 text-muted-foreground/70"
						/>
						{t("Absteigend")}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => column.clearSorting()}>
						<IconArrowsSort
							stroke={1.75}
							className="mr-2 h-3.5 w-3.5 text-muted-foreground/70"
						/>
						{t("Löschen")}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
