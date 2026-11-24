import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/** Registered at account.hawconnect.de (backend config/oidc-clients.json). */
export const SSO_CLIENT_ID = "hawconnect-console";
/** How long a started sign-in may take before the callback is refused. */
export const SSO_MAX_AGE_MS = 10 * 60 * 1000;

export type PendingSso = {
	state: string;
	nonce: string;
	verifier: string;
	createdAt: number;
};

const random = (bytes: number) => randomBytes(bytes).toString("base64url");
const callbackUrl = (appUrl: string) =>
	`${new URL(appUrl).origin}/auth/callback`;

/** The login-site address to send the browser to, and what to remember until it comes back. */
export function startSso(options: {
	loginUrl: string;
	appUrl: string;
	now?: number;
}): { authorizeUrl: string; pending: PendingSso } {
	const pending: PendingSso = {
		state: random(32),
		nonce: random(32),
		verifier: random(48),
		createdAt: options.now ?? Date.now(),
	};
	const authorize = new URL(
		`${new URL(options.loginUrl).origin}/api/auth/oauth2/authorize`,
	);
	authorize.search = new URLSearchParams({
		response_type: "code",
		client_id: SSO_CLIENT_ID,
		redirect_uri: callbackUrl(options.appUrl),
		scope: "openid email",
		state: pending.state,
		nonce: pending.nonce,
		code_challenge: createHash("sha256")
			.update(pending.verifier)
			.digest("base64url"),
		code_challenge_method: "S256",
	}).toString();
	return { authorizeUrl: authorize.toString(), pending };
}

const same = (a: string, b: string) => {
	const left = Buffer.from(a);
	const right = Buffer.from(b);
	return left.length === right.length && timingSafeEqual(left, right);
};

/**
 * Checks the login site's answer against the started sign-in and builds the
 * body the backend redeems (`POST /api/admin/auth/oidc`).
 */
export function checkSsoCallback(options: {
	query: URLSearchParams;
	pending: PendingSso | undefined;
	loginUrl: string;
	appUrl: string;
	now?: number;
}):
	| {
			ok: true;
			body: {
				code: string;
				codeVerifier: string;
				redirectUri: string;
				nonce: string;
			};
	  }
	| { ok: false } {
	const { query, pending } = options;
	const now = options.now ?? Date.now();
	if (!pending || query.has("error")) return { ok: false };
	if (now - pending.createdAt > SSO_MAX_AGE_MS || pending.createdAt > now)
		return { ok: false };
	if (!same(query.get("state") ?? "", pending.state)) return { ok: false };
	// RFC 9207: the answer must come from our login site.
	const iss = query.get("iss");
	if (iss !== null && iss !== new URL(options.loginUrl).origin)
		return { ok: false };
	const code = query.get("code") ?? "";
	if (!code || code.length > 512) return { ok: false };
	return {
		ok: true,
		body: {
			code,
			codeVerifier: pending.verifier,
			redirectUri: callbackUrl(options.appUrl),
			nonce: pending.nonce,
		},
	};
}
