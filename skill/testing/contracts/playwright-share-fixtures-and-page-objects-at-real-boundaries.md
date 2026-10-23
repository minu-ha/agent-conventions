# Share Fixtures and Page Objects at Real Boundaries

**Impact: MEDIUM (테스트의 핵심 시나리오를 숨기지 않고 중복되는 준비와 탐색을 줄입니다)**

공통 세션과 자원 수명은 fixture로, 반복되는 locator와 화면 조작은 소유 화면의 page object로 묶습니다.
한 번 쓰는 단언이나 작은 동작마다 helper를 만들지 않습니다.

page object는 시나리오의 기대값을 숨기지 않고 테스트가 결과를 단언하게 합니다.
fixture의 의존성 이름과 scope는 실제 사용 범위에 맞추고 테스트별 상태를 worker 전역으로 올리지 않습니다.
Playwright가 매개변수 구조분해로 fixture 의존성을 읽는 콜백은 그 외부 호출 계약을 유지합니다.
다른 객체 필드까지 구조분해하는 근거로 넓히지 않습니다.

참고: [공식 문서](https://playwright.dev/docs/test-fixtures).

**Incorrect 1 (테스트마다 같은 화면의 locator 체인을 반복합니다):**

```ts
// test/orders/orders.e2e.spec.ts
import { expect, test } from "@playwright/test";

test("목록에 주문이 표시된다", async ({ page }) => {
	/**
	 * GIVEN
	 * 조회할 주문 목록
	 */
	const path = "/orders";

	/**
	 * WHEN
	 * 주문 목록 진입
	 */
	await page.goto(path);

	/**
	 * THEN
	 * 목록의 대표 주문
	 */
	await expect(page
		.getByRole("table", { name: "주문 목록" })
		.getByRole("row")
		.filter({ hasText: "order-1" })).toBeVisible();
});

test("주문을 누르면 상세로 이동한다", async ({ page }) => {
	/**
	 * GIVEN
	 * 대표 주문이 있는 목록
	 */
	await page.goto("/orders");

	/**
	 * WHEN
	 * 대표 주문 링크 클릭
	 */
	await page
		.getByRole("table", { name: "주문 목록" })
		.getByRole("row")
		.filter({ hasText: "order-1" }).getByRole("link").click();

	/**
	 * THEN
	 * 선택한 주문의 상세 URL
	 */
	await expect(page).toHaveURL(/\/orders\/order-1$/);
});
```

**Correct 1 (반복되는 화면 탐색을 page object fixture로 공유합니다):**

```ts
// test/orders/orders.e2e.spec.ts
import { expect, test as base } from "@playwright/test";

import type { Page } from "@playwright/test";

/**
 * 주문 화면의 반복 탐색과 이동
 */
class OrdersPage {
	constructor(private readonly page: Page) {}

	get firstOrder() {
		return this.page
			.getByRole("table", { name: "주문 목록" })
			.getByRole("row")
			.filter({ hasText: "order-1" });
	}

	async goto() {
		await this.page.goto("/orders");
	}
}

/**
 * 주문 화면 전용 fixture
 */
interface Fixtures {
	/**
	 * 테스트가 받은 page를 사용하는 화면 객체
	 */
	ordersPage: OrdersPage;
}

const test = base.extend<Fixtures>({
	ordersPage: async ({ page }, use) => {
		await use(new OrdersPage(page));
	},
});

test("목록에 주문이 표시된다", async ({ ordersPage }) => {
	/**
	 * GIVEN
	 * 기본 fixture가 제공하는 order-1 주문과 화면 객체
	 */

	/**
	 * WHEN
	 * 주문 목록 진입
	 */
	await ordersPage.goto();

	/**
	 * THEN
	 * 목록의 대표 주문
	 */
	await expect(ordersPage.firstOrder).toBeVisible();
});

test("주문을 누르면 상세로 이동한다", async ({ page, ordersPage }) => {
	/**
	 * GIVEN
	 * 대표 주문이 있는 목록
	 */
	await ordersPage.goto();

	/**
	 * WHEN
	 * 대표 주문 링크 클릭
	 */
	await ordersPage.firstOrder.getByRole("link").click();

	/**
	 * THEN
	 * 선택한 주문의 상세 URL
	 */
	await expect(page).toHaveURL(/\/orders\/order-1$/);
});
```

> 나머지 예시와 예외는 [full rule](../rules/05-03-playwright-share-fixtures-and-page-objects-at-real-boundaries.md)에 있습니다.
