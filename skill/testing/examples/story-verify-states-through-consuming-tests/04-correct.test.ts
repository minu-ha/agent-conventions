// test/orders/order-dialog.integration.spec.ts
import { expect, test } from "@playwright/test";

test("주문을 저장하면 callback에 선택한 ID를 전달한다", async ({ mount }) => {
	/**
	 * GIVEN
	 * 브라우저에서 callback 결과를 기록하는 story
	 */
	const storyId = "orders/order-dialog/SaveResult";

	/**
	 * WHEN
	 * 모달을 mount하고 저장
	 */
	const view = await mount(storyId);
	await view.getByRole("button", { name: "저장", exact: true }).click();

	/**
	 * THEN
	 * story가 실제 callback으로 받은 주문 ID
	 */
	// [!code ++]
	await expect(view.getByTestId("saved-order")).toHaveText("order-1");
});
