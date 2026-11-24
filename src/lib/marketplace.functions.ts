import { createServerFn } from "@tanstack/react-start";
import { adminRequest } from "#/lib/admin-api";
import { requireAccessToken, requireCapability } from "#/lib/auth.server";
import {
	type BlockInput,
	blockInputSchema,
	type DecisionInput,
	decisionInputSchema,
	liftBlockSchema,
	type PostFilter,
	postFilterSchema,
	type RemovePostInput,
	removePostSchema,
	reportStatusSchema,
	restorePostSchema,
} from "#/lib/schemas/marketplace";

export type MarketReport = {
	id: string;
	kind: "post" | "message";
	reason: string;
	note: string | null;
	createdAt: string;
	/** For message reports this is the post's count, not the message's. */
	reportCount: number;
	post: {
		id: string | null;
		title: string;
		description: string;
		category: string | null;
		details: Record<string, string | number | string[]>;
		status: string;
		posterEmail: string | null;
	};
	message: { body: string; senderEmail: string | null } | null;
	reporterEmail: string | null;
	/** Set on decided reports only. */
	decision: "dismissed" | "removed" | null;
	decidedAt: string | null;
	/** The moderator's statement of reasons for a removal. */
	decisionReason: string | null;
};
export type MarketBlock = {
	id: string;
	userId: string | null;
	reason: string;
	until: string;
	createdBy: string;
	createdAt: string;
	liftedAt: string | null;
};

export type MarketPost = {
	id: string;
	type: "offer" | "request";
	category: string;
	title: string;
	description: string;
	priceEur: number | null;
	priceFree: boolean;
	priceUnit: string | null;
	location: string | null;
	details: Record<string, string | number | string[]>;
	reportCount: number;
	status: string;
	posterEmail: string | null;
	createdAt: string;
	expiresAt: string;
};

async function token() {
	await requireCapability("marketplace");
	return (await requireAccessToken()).accessToken;
}
export const listMarketReportsFn = createServerFn({ method: "GET" })
	.validator((data: { status: "open" | "decided" }) =>
		reportStatusSchema.parse(data),
	)
	.handler(async ({ data }) =>
		adminRequest<{ items: MarketReport[] }>(
			`/marketplace/reports?status=${data.status}`,
			await token(),
		),
	);
export const decideMarketReportFn = createServerFn({ method: "POST" })
	.validator((data: DecisionInput) => decisionInputSchema.parse(data))
	.handler(async ({ data }) =>
		adminRequest<{ ok: true; mailSent: boolean }>(
			`/marketplace/reports/${data.id}/decision`,
			await token(),
			"POST",
			{ action: data.action, reason: data.reason },
		),
	);
export const listMarketBlocksFn = createServerFn({ method: "GET" }).handler(
	async () =>
		adminRequest<{ items: MarketBlock[] }>(
			"/marketplace/blocks",
			await token(),
		),
);
export const createMarketBlockFn = createServerFn({ method: "POST" })
	.validator((data: BlockInput) => blockInputSchema.parse(data))
	.handler(async ({ data }) =>
		adminRequest<{ id: string; until: string; mailSent: boolean }>(
			"/marketplace/blocks",
			await token(),
			"POST",
			data,
		),
	);
export const liftMarketBlockFn = createServerFn({ method: "POST" })
	.validator((data: { id: string }) => liftBlockSchema.parse(data))
	.handler(async ({ data }) =>
		adminRequest<{ ok: true }>(
			`/marketplace/blocks/${data.id}`,
			await token(),
			"DELETE",
		),
	);
export const listMarketPostsFn = createServerFn({ method: "GET" })
	.validator((data: PostFilter) => postFilterSchema.parse(data))
	.handler(async ({ data }) => {
		const query = new URLSearchParams({ view: data.view });
		if (data.q) query.set("q", data.q);
		return adminRequest<{ items: MarketPost[] }>(
			`/marketplace/posts?${query}`,
			await token(),
		);
	});
export const removeMarketPostFn = createServerFn({ method: "POST" })
	.validator((data: RemovePostInput) => removePostSchema.parse(data))
	.handler(async ({ data }) =>
		adminRequest<{ ok: true; mailSent: boolean }>(
			`/marketplace/posts/${data.id}/remove`,
			await token(),
			"POST",
			{ reason: data.reason },
		),
	);
export const restoreMarketPostFn = createServerFn({ method: "POST" })
	.validator((data: { id: string }) => restorePostSchema.parse(data))
	.handler(async ({ data }) =>
		adminRequest<{ ok: true }>(
			`/marketplace/posts/${data.id}/restore`,
			await token(),
			"POST",
		),
	);
