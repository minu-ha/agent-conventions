---
title: Keep One Behavior Per Test
titleKo: 테스트 하나에 행위 하나
impact: HIGH
impactDescription: >-
  keeps setup, action, and assertions focused so browser failures point to one behavior instead of many unrelated checks
impactDescriptionKo: setup·동작·단정을 좁게 유지해 브라우저 실패가 여러 검사가 아니라 한 행위를 가리키게 함
tags: test-design, scope, assertions
---

## Keep One Behavior Per Test

**Impact: HIGH (keeps setup, action, and assertions focused so browser failures point to one behavior instead of many
unrelated checks)**

한 테스트는 한 행동과 한 결과에 집중합니다.
기본 구조는 `Arrange -> Act -> Assert` 순서를 따르고, unrelated assertion을 한 테스트 안에 과도하게 나열하지 않습니다.

**Incorrect (여러 행동과 결과를 한 test에 밀어 넣음):**

```ts
test("목록 조회와 생성과 삭제가 모두 동작한다", async ({page}) => {
	// 너무 많은 행동과 assertion
});
```

**Correct (행동과 결과를 하나로 좁힘):**

```ts
test("저장 후 성공 토스트를 표시한다", async ({page}) => {
	// 한 행동 + 한 핵심 결과
});
```
