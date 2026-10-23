// test/orders/chart.integration.spec.ts
import { expect, test } from "@playwright/test";

test("차트 이미지가 기준값과 같다", async ({ page }) => {
	await page.goto("/orders/chart");
	const chart = page.getByTestId("quantity-chart");
	await expect(chart).toHaveAttribute("data-state", "ready");
	expect(await chart.screenshot({ animations: "disabled" })).toMatchSnapshot(
		"quantity-chart.png",
	);
});
