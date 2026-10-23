// src/service/msw/worker.ts
import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";

import { mock_unhandled_api_prefix } from "@/service/msw/_constant/mock";

/**
 * Node registry와 따로 만든 브라우저 전용 정상 데이터
 */
// [!code error]
const browser_handlers = [http.get("*/api/orders", () => {
	return HttpResponse.json({ items: [], total: 0 });
})];

/**
 * mock 모드 진입에서만 호출하는 브라우저 worker 시작
 */
export const startMockWorker = async () => {
	return setupWorker(...browser_handlers).start({
		onUnhandledRequest: (request, print) => {
			if (new URL(request.url).pathname.startsWith("/api/")) {
				console.error(mock_unhandled_api_prefix, request.method, request.url);
				print.error();
			}
		},
	});
};
