// test/orders/orders.integration.spec.ts
import { expect, test } from "@test/_fixture/test";

import { createGetOrdersStatus200 } from "@/service/__kubb/mock/orders/get-orders";
import { getOrdersHandler } from "@/service/__kubb/msw/orders/get-orders-handler";

test("빈 주문 목록에 안내가 표시된다", async ({ mockApi, mount }) => {
	/**
	 * GIVEN
	 * 빈 주문 목록을 응답하는 서버
	 */
	mockApi.use(getOrdersHandler(createGetOrdersStatus200({
		items: [], total: 0, page: 1, updatedAt: "2026-03-01T03:00:00Z",
	})));

	/**
	 * WHEN
	 * 실제 provider와 주문 화면을 가진 story 진입
	 */
	const view = await mount("orders/Default");

	/**
	 * THEN
	 * 실제 응답 처리 뒤 빈 목록 안내
	 */
	// [!code ++]
	await expect(view.getByRole("status")).toHaveText("주문이 없습니다");
});
