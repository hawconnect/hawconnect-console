import { createFileRoute } from "@tanstack/react-router";
import { AdminAPIError, adminRequest } from "#/lib/admin-api.server";
import { serverConfig } from "#/lib/config";
import { getAppSession } from "#/lib/session";
import { checkSsoCallback } from "#/lib/sso";

const go = (location: string) =>
	new Response(null, {
		status: 302,
		headers: { Location: location, "Cache-Control": "no-store" },
	});

/** account.hawconnect.de returns here; the backend redeems the code. */
export const Route = createFileRoute("/auth/callback")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const session = await getAppSession();
				const checked = checkSsoCallback({
					query: new URL(request.url).searchParams,
					pending: session.data.sso,
					loginUrl: serverConfig.loginUrl,
					appUrl: serverConfig.appUrl,
				});
				// A started sign-in is used once, whatever the outcome.
				await session.clear();
				if (!checked.ok) return go("/login?error=sso");
				try {
					const { token } = await adminRequest<{ token: string }>(
						"/auth/oidc",
						undefined,
						"POST",
						checked.body,
					);
					await session.update({ accessToken: token });
					return go("/");
				} catch (error) {
					const forbidden =
						error instanceof AdminAPIError && error.status === 403;
					return go(forbidden ? "/login?error=no-access" : "/login?error=sso");
				}
			},
		},
	},
});
