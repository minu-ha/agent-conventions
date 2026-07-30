---
title: Follow the Declared Integration or E2E Writing Sequence
titleKo: 정해진 integration·e2e 작성 순서를 따르기
impact: MEDIUM
impactDescription: 동작을 쓰기 전에 테스트 층위와 의존 경계를 먼저 분류하게 해 혼란스러운 setup 을 줄임
tags: workflow, writing-order, setup
---

## Follow the Declared Integration or E2E Writing Sequence

**Impact: MEDIUM (동작을 쓰기 전에 테스트 층위와 의존 경계를 먼저 분류하게 해 혼란스러운 setup 을 줄임)**

신규 테스트를 쓸 때는 먼저 Integration인지 E2E인지 결정하고, 그 레벨에 맞는 setup만 선언한 뒤,
사용자 locator로 action을 작성하고, web-first assertion으로 결과를 검증합니다.
마지막으로 정말 필요한 비동기 경계만 명시적으로 기다립니다.

**Incorrect (레벨 구분 없이 test body부터 쓰기 시작):**

```txt
1. 일단 page.goto()부터 작성
2. 중간에 route mocking과 실제 로그인 helper를 같이 추가
3. 나중에 파일명을 *.spec.ts 또는 *.e2e.spec.ts로 고민
```

**Correct (레벨을 먼저 고정하고 그 경계에 맞게 작성):**

```txt
1. 먼저 Integration인지 E2E인지 결정
2. 의존 경계에 맞는 setup만 선언
3. 사용자 locator로 action 작성
4. web-first assertion으로 결과 검증
5. 필요한 비동기 경계만 상태 기반으로 대기
```
