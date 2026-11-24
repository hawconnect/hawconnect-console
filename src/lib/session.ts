import {
	clearSession,
	getSession,
	updateSession,
} from "@tanstack/react-start/server";
import { assertSessionSecret } from "#/lib/config";
import type { PendingSso } from "#/lib/sso";

const config = () => ({
	name: "hawconnect-console-session",
	password: assertSessionSecret(),
	cookie: {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax" as const,
		maxAge: 60 * 60 * 8,
		path: "/",
	},
});
/** `sso` holds a started login-site sign-in until its callback. */
type Data = { accessToken?: string; sso?: PendingSso };
export async function getAppSession() {
	const c = config();
	const session = await getSession<Data>(c);
	return {
		data: session.data,
		update: async (data: Data) => {
			await updateSession<Data>(c, data);
		},
		clear: async () => {
			await clearSession(c);
		},
	};
}
