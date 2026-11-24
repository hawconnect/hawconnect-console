import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "#/components/layout/app-shell";
import { getNavStatusFn } from "#/lib/dashboard.functions";
import { requireAppUser } from "#/lib/require-app-user";

export const Route = createFileRoute("/_app")({
	beforeLoad: ({ context }) => {
		const user = requireAppUser(context.user);
		return { user };
	},
	// Sidebar badges; a failure must never block a page.
	loader: () => getNavStatusFn().catch(() => undefined),
	staleTime: 30_000,
	component: AppLayout,
});

function AppLayout() {
	return (
		<AppShell mainClassName="flex max-w-[92rem] flex-col gap-6 sm:gap-8">
			<Outlet />
		</AppShell>
	);
}
