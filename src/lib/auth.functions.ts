import { createServerFn } from "@tanstack/react-start";
import { getSessionUser } from "#/lib/auth.server";
export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(() =>
	getSessionUser(),
);
export const getAuthStatusFn = createServerFn({ method: "GET" }).handler(
	async () => ({
		user: await getSessionUser(),
		authMock: false,
		authConfigured: true,
	}),
);
