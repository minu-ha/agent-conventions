import {createRequire} from "node:module";

/**
 * preview 빌드 위에서 구역을 찍고 번호 배지를 DOM에 꽂아 캡처에 구움
 */
const {chromium} = createRequire(`${process.cwd()}/package.json`)("playwright");
const marks = [
	{selector: ".pg_orders__panel", label: 1},
	{selector: ".pg_orders__table", label: 2},
];
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1600, height: 1000}});

await page.addInitScript(() => {
	sessionStorage.setItem("auth-storage", JSON.stringify({token: "dev"}));
});
await page.goto("http://localhost:5175/orders");
await page.evaluate((marks) => {
	for (const mark of marks) {
		const box = document.querySelector(mark.selector).getBoundingClientRect();
		const badge = document.createElement("span");

		badge.textContent = String(mark.label);
		badge.style.cssText = `position:fixed;left:${box.left + 8}px;top:${box.top + 8}px;z-index:9999;width:24px;height:24px;border-radius:50%;background:#1766b4;color:#fff;font:700 14px/24px sans-serif;text-align:center`;
		document.body.append(badge);
	}
}, marks);
await page.locator(".pg_orders__root").screenshot({path: "content/public/img/orders/list.png"});
await browser.close();
