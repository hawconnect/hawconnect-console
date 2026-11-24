import { createFileRoute } from "@tanstack/react-router";
import { serverConfig } from "#/lib/config";
import { getAppSession } from "#/lib/session";
import { startSso } from "#/lib/sso";

/** Sends the browser to account.hawconnect.de; the callback finishes the sign-in. */
export const Route = createFileRoute("/auth/start")({
	server: {
		handlers: {
			GET: async () => {
				const { authorizeUrl, pending } = startSso({
					loginUrl: serverConfig.loginUrl,
					appUrl: serverConfig.appUrl,
				});
				await (await getAppSession()).update({ sso: pending });
				return new Response(null, {
					status: 302,
					headers: { Location: authorizeUrl, "Cache-Control": "no-store" },
				});
			},
		},
	},
});
