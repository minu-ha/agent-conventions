---
title: Name Tests by User Action and Result
titleKo: 테스트 이름은 사용자 동작과 결과로
impact: MEDIUM-HIGH
impactDescription: makes browser tests readable as user behavior instead of implementation detail or setup jargon
tags: test-titles, naming, behavior
---

## Name Tests by User Action and Result

**Impact: MEDIUM-HIGH (makes browser tests readable as user behavior instead of implementation detail or setup jargon)**

`test.describe()`는 기능 단위 이름을 쓰고, `test()` 제목은 “사용자 행동 + 기대 결과” 형태로 작성합니다.
구현 세부사항이나 내부 state가 아니라 사용자가 보는 결과가 읽혀야 합니다.

**Incorrect (구현 세부사항이나 setup 중심 제목):**

```ts
test("calls members API and updates state", async ({page}) => {});
test("test 1", async ({page}) => {});
```

**Correct (행동과 결과가 함께 드러나는 제목):**

```ts
test("저장 버튼을 누르면 성공 토스트를 표시한다", async ({page}) => {});
test("권한이 없으면 멤버 화면 진입 시 로그인으로 이동한다", async ({page}) => {});
```
