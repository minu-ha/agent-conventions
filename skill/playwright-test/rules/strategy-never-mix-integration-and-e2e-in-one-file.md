---
title: Never Mix Integration and E2E in One File
titleKo: integration과 e2e를 한 파일에 섞지 않기
impact: HIGH
impactDescription: keeps test intent and failure diagnosis clear by assigning one runtime boundary per spec file
impactDescriptionKo: spec 파일마다 런타임 경계를 하나로 배정해 테스트 의도와 실패 진단을 분명하게 유지함
tags: levels, files, boundaries
---

## Never Mix Integration and E2E in One File

**Impact: HIGH (keeps test intent and failure diagnosis clear by assigning one runtime boundary per spec file)**

한 spec 파일 안에는 하나의 테스트 레벨만 둡니다.
Integration과 E2E는 도구가 아니라 의존 경계로 구분되므로,
한 파일 안에서 mock 기반 테스트와 실제 시스템 기반 테스트를 섞지 않습니다.

**Incorrect (한 파일 안에서 Integration과 E2E를 섞음):**

```ts
test("mocked validation error", async ({page}) => {
	// integration
});

test("real login smoke", async ({page}) => {
	// e2e
});
```

**Correct (레벨마다 파일을 분리):**

```txt
login.spec.ts
login.e2e.spec.ts
```
