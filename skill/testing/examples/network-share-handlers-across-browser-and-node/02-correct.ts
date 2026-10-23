// src/service/msw/worker.ts
import { setupWorker } from "msw/browser";

import { mock_unhandled_api_prefix } from "@/service/msw/_constant/mock";
import { mock_handlers } from "@/service/msw/handlers";

/**
 * mock 모드 진입에서만 호출하는 브라우저 worker 시작
 */
export const startMockWorker = async () => {
	// [!code ++]
	return setupWorker(...mock_handlers).start({
		onUnhandledRequest: (request, print) => {
			if (new URL(request.url).pathname.startsWith("/api/")) {
				console.error(mock_unhandled_api_prefix, request.method, request.url);
				print.error();
			}
		},
	});
};
