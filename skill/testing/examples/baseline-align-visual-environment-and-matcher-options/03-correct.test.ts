// test/orders/chart.integration.spec.ts
import { expect, test } from "@playwright/test";

test("차트 이미지가 기준값과 같다", async ({ page }) => {
	/**
	 * GIVEN
	 * 렌더가 끝난 수량 차트
	 */
	await page.goto("/orders/chart");
	const chart = page.getByTestId("quantity-chart");
	await expect(chart).toHaveAttribute("data-state", "ready");

	/**
	 * WHEN
	 * 움직임을 끈 chart 이미지 캡처
	 */
	const image = await chart.screenshot({ animations: "disabled" });

	/**
	 * THEN
	 * 동일 환경의 이미지 기준값
	 */
	expect(image).toMatchSnapshot("quantity-chart.png");
});
