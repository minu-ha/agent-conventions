// test/orders/orders.e2e.spec.ts
import { expect, test } from "@playwright/test";

test("다운로드를 클릭하면 주문 파일을 받는다", async ({ page }) => {
	/**
	 * GIVEN
	 * 다운로드할 주문 목록
	 */
	await page.goto("/orders");

	/**
	 * WHEN
	 * 다운로드 대기를 먼저 등록한 뒤 버튼 클릭
	 */
	// [!code ++]
	const pendingDownload = page.waitForEvent("download");
	await page.getByRole("button", { name: "다운로드", exact: true }).click();
	const download = await pendingDownload;

	/**
	 * THEN
	 * 다운로드한 주문 파일 이름
	 */
	expect(download.suggestedFilename()).toBe("orders.xlsx");
});
