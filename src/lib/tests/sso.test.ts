import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { checkSsoCallback, SSO_MAX_AGE_MS, startSso } from "#/lib/sso";

const LOGIN = "https://account.hawconnect.de";
const APP = "https://console.hawconnect.de";

describe("startSso", () => {
	test("sends the browser to the login site with PKCE, state and nonce", () => {
		const { authorizeUrl, pending } = startSso({
			loginUrl: LOGIN,
			appUrl: APP,
			now: 1000,
		});
		const url = new URL(authorizeUrl);
		expect(`${url.origin}${url.pathname}`).toBe(
			`${LOGIN}/api/auth/oauth2/authorize`,
		);
		const q = url.searchParams;
		expect(q.get("client_id")).toBe("hawconnect-console");
		expect(q.get("redirect_uri")).toBe(`${APP}/auth/callback`);
		expect(q.get("response_type")).toBe("code");
		expect(q.get("scope")).toBe("openid email");
		expect(q.get("state")).toBe(pending.state);
		expect(q.get("nonce")).toBe(pending.nonce);
		expect(q.get("code_challenge_method")).toBe("S256");
		expect(q.get("code_challenge")).toBe(
			createHash("sha256").update(pending.verifier).digest("base64url"),
		);
		expect(pending.verifier).toMatch(/^[A-Za-z0-9_-]{43,128}$/);
		expect(pending.createdAt).toBe(1000);
	});

	test("uses fresh random values every time", () => {
		const a = startSso({ loginUrl: LOGIN, appUrl: APP }).pending;
		const b = startSso({ loginUrl: LOGIN, appUrl: APP }).pending;
		expect(a.state).not.toBe(b.state);
		expect(a.nonce).not.toBe(b.nonce);
		expect(a.verifier).not.toBe(b.verifier);
	});
});

describe("checkSsoCallback", () => {
	const { pending } = startSso({ loginUrl: LOGIN, appUrl: APP, now: 0 });
	const query = (values: Record<string, string>) => new URLSearchParams(values);

	test("returns the exchange body for a matching callback", () => {
		expect(
			checkSsoCallback({
				query: query({ code: "c0de", state: pending.state, iss: LOGIN }),
				pending,
				loginUrl: LOGIN,
				appUrl: APP,
				now: 10,
			}),
		).toEqual({
			ok: true,
			body: {
				code: "c0de",
				codeVerifier: pending.verifier,
				redirectUri: `${APP}/auth/callback`,
				nonce: pending.nonce,
			},
		});
	});

	test("refuses a missing or different state, another issuer, an error or an old start", () => {
		const base = { pending, loginUrl: LOGIN, appUrl: APP, now: 10 };
		for (const [values, extra] of [
			[{ code: "c0de", state: "other" }, {}],
			[{ code: "c0de" }, {}],
			[{ code: "c0de", state: pending.state, iss: "https://evil.example" }, {}],
			[{ error: "access_denied", state: pending.state }, {}],
			[{ state: pending.state }, {}],
			[{ code: "c0de", state: pending.state }, { now: SSO_MAX_AGE_MS + 1 }],
			[{ code: "c0de", state: pending.state }, { pending: undefined }],
		] as const)
			expect(
				checkSsoCallback({ ...base, ...extra, query: query(values) }).ok,
			).toBe(false);
	});
});
