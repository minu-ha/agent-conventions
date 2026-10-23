// test/_fixture/e2e-test.ts
import { test as base, expect } from "@playwright/test";

import type { ConsoleMessage } from "@playwright/test";

import { mock_unhandled_api_prefix } from "@/service/msw/_constant/mock";

/**
 * mock 앱 E2E에서 자동 적용하는 미처리 API 검사
 */
interface Fixtures {
	/**
	 * 테스트의 모든 이동을 통틀어 수집하는 오류
	 */
	mockApiFailures: undefined;
}

export { expect };

/**
 * mock 앱 E2E spec이 가져오는 test. 화면의 오류 처리와 별개로 API 누락을 검출
 */
export const test = base.extend<Fixtures>({
	mockApiFailures: [async ({ page }, use) => {
		const unhandled: string[] = [];
		/**
		 * 브라우저 문서가 교체돼도 보존되는 Node 기록
		 */
		const collectMockError = (message: ConsoleMessage) => {
			if (message.type() === "error" && message.text().startsWith(mock_unhandled_api_prefix)) {
				unhandled.push(message.text());
			}
		};
		page.on("console", collectMockError);
		try {
			await use(undefined);
			// [!code ++]
			expect(unhandled, "미처리 mock API 요청").toStrictEqual([]);
		} finally {
			page.off("console", collectMockError);
		}
	}, { auto: true }],
});
