---
title: Cover State Matrices and User-visible Results in Integration
titleKo: integration의 상태 조합과 사용자에게 보이는 결과 검증
impact: HIGH
impactDescription: 넓은 UI 상태 조합과 각 상태의 눈에 보이는 결과를 integration 테스트가 책임지게 합니다
tags: integration, states, results
---

## Cover State Matrices and User-visible Results in Integration

**Impact: HIGH (넓은 UI 상태 조합과 각 상태의 눈에 보이는 결과를 integration 테스트가 책임지게 합니다)**

Integration은 상태 매트릭스를 책임집니다.
loading, empty, error, success, validation error, permission redirect, search/pagination 동기화를 우선 검토하고,
submit 계열 테스트는 request body 검증만으로 끝내지 말고 저장 후 URL, 토스트,
화면 전환 같은 사용자 결과도 함께 확인합니다.

**Incorrect (request body만 보고 사용자 결과는 보지 않음):**

```ts
test("저장 요청 body를 보낸다", async ({page}) => {
	// request payload만 확인하고 끝냄
});
```

**Correct (상태와 사용자 결과를 함께 검증):**

```ts
test("저장 후 목록 화면으로 이동하고 성공 토스트를 표시한다", async ({page}) => {
	// payload 검증 + URL/토스트/화면 변화 확인
});
```
