// test/orders/orders.integration.spec.ts
import { expect, test } from "@test/_fixture/test";

import { createGetOrdersStatus500 } from "@/service/__kubb/mock/orders/get-orders";
import { getOrdersHandler, getOrdersHandlerResponse500 } from "@/service/__kubb/msw/orders/get-orders-handler";

test("주문 조회가 실패하면 오류 안내가 표시된다", async ({ mockApi, mount }) => {
	/**
	 * GIVEN
	 * 정상 registry에서 주문 조회만 500으로 실패하는 서버
	 */
	// [!code ++]
	mockApi.use(getOrdersHandler(() => {
		return getOrdersHandlerResponse500(createGetOrdersStatus500({ message: "목록을 불러오지 못했습니다" }));
	}));

	/**
	 * WHEN
	 * 실제 provider와 주문 화면을 가진 story 진입
	 */
	const view = await mount("orders/Default");

	/**
	 * THEN
	 * 실패 응답 처리 뒤 오류 안내
	 */
	await expect(view.getByRole("alert")).toHaveText("목록을 불러오지 못했습니다");
});
