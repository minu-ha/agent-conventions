// test/orders/orders.e2e.spec.ts
import { expect, test } from "@playwright/test";

test("다운로드를 클릭하면 주문 파일을 받는다", async ({ page }) => {
	await page.goto("/orders");
	// [!code ++]
	const pendingDownload = page.waitForEvent("download");
	await page.getByRole("button", { name: "다운로드", exact: true }).click();
	const download = await pendingDownload;
	expect(download.suggestedFilename()).toBe("orders.xlsx");
});
