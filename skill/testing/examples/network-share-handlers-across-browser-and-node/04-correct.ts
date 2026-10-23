// test/_fixture/test.ts
import { test as base, expect } from "@playwright/test";
import { toMockRoute } from "@test/_fixture/to-mock-route";

import type { RequestHandler } from "msw";

import { mock_handlers } from "@/service/msw/handlers";

/**
 * 사례별 응답 덮어쓰기
 */
interface Fixtures {
	/**
	 * 기본 registry보다 먼저 해석할 handler의 등록
	 */
	mockApi: {
		/**
		 * 요청 시작 전에 추가할 사례 handler
		 */
		use: (...handlers: RequestHandler[]) => void;
	};
}

export { expect };

/**
 * 테스트마다 공유 registry 복사와 route 수명 소유. 새 context 사용을 기본값으로 유지
 */
export const test = base.extend<Fixtures>({
	mockApi: [async ({ page }, use) => {
		const handlers: RequestHandler[] = [...mock_handlers];
		const route = toMockRoute(handlers);
		await page.route("**/api/**", route);
		try {
			await use({
				use: (...overrides) => {
					// [!code ++]
					handlers.unshift(...overrides);
				},
			});
		} finally {
			await page.unroute("**/api/**", route);
		}
	}, { auto: true }],
});
