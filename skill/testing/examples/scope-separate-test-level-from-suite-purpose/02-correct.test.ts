// test/orders/orders.e2e.spec.ts
import { expect, test } from "@playwright/test";

// baseURL: 검증할 배포 산출물. fixture에서 세션과 읽기 전용 order-1 데이터를 준비
// [!code ++]
test("주문 화면에 진입하면 대표 목록을 조회한다", { tag: "@smoke" }, async ({ page }) => {
	/**
	 * GIVEN
	 * 배포 환경의 읽기 전용 주문 목록 경로
	 */
	const path = "/orders";

	/**
	 * WHEN
	 * 실제 앱의 주문 화면 진입
	 */
	await page.goto(path);

	/**
	 * THEN
	 * 앱 초기화와 대표 데이터 조회의 연결
	 */
	await expect(page.getByRole("heading", { name: "주문", exact: true })).toBeVisible();
	await expect(page.getByRole("table", { name: "주문 목록" }).getByRole("cell", { name: "order-1", exact: true })).toBeVisible();
});
