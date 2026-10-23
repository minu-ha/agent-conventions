// test/_fixture/to-mock-route.ts
import { Buffer } from "node:buffer";
import { getResponse } from "msw";

import type { Route } from "@playwright/test";
import type { RequestHandler } from "msw";

/**
 * API 전용 bridge. 미처리와 passthrough는 실제 호출 허용 없이 외부로 보내지 않음
 */
export const toMockRoute = (handlers: RequestHandler[]) => {
	return async (route: Route) => {
		const request = route.request();
		const requestBody = request.postDataBuffer();
		// [!code ++]
		const response = await getResponse(handlers, new Request(request.url(), {
			method: request.method(),
			headers: await request.allHeaders(),
			body: requestBody === null ? undefined : new Uint8Array(requestBody),
		}), { baseUrl: new URL(request.url()).origin });

		if (!response || response.headers.get("x-msw-intention") === "passthrough") {
			throw new Error(`Unhandled mock API: ${request.method()} ${request.url()}`);
		}
		const cookies = response.headers.getSetCookie();

		await route.fulfill({
			status: response.status,
			headers: {
				...Object.fromEntries(response.headers),
				...(cookies.length > 0 ? { "set-cookie": cookies.join("\n") } : {}),
			},
			body: Buffer.from(await response.arrayBuffer()),
		});
	};
};
