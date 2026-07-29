---
title: Mock Unit Boundaries and Verify E2E Wiring
impact: CRITICAL
impactDescription: keeps service unit tests fast and focused while making e2e tests prove real Nest wiring end to end
tags: unit-tests, e2e, mocks
---

## Mock Unit Boundaries and Verify E2E Wiring

**Impact: CRITICAL (keeps service unit tests fast and focused while making e2e tests prove real Nest wiring end to end)**

unit test에서는 DB, 외부 API, JWT, cache 같은 외부 의존성을 mock 처리하고
Service public 메서드의 핵심 분기와 예외를 검증합니다.
e2e test에서는 `AppModule` 또는 필요한 실제 모듈 조합을 띄우고, `supertest`로 HTTP 진입점부터 ValidationPipe, Filter,
Service, Prisma, DB 반영까지 실제 wiring을 검증합니다.

**Incorrect (unit에서 실제 DB를 띄우거나 e2e에서 핵심 wiring을 검증하지 않음):**

```txt
- unit test에서 실제 PostgreSQL 연결
- e2e test는 상태 코드만 보고 DB 반영 결과는 확인하지 않음
```

**Correct (레벨에 맞는 의존 전략을 사용):**

```ts
describe("AuthService", () => {
	it("login - invalid password increases lockCount", async () => {
		// unit: 외부 의존성은 jest.fn()으로 대체
	});
});
```

```ts
// e2e: supertest로 실제 HTTP 요청 + DB 반영 결과 검증
await request(app.getHttpServer()).post("/users").send(payload).expect(201);
```
