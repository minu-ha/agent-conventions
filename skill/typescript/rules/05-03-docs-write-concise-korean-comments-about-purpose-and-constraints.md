---
title: Write Concise Korean Comments About Purpose and Constraints
titleKo: 주석은 목적과 제약을 한국어로 짧게 적습니다
impact: MEDIUM
impactDescription: 코드 동작을 옮겨 적지 않고 의도와 제약에 주석을 모읍니다
appliesWhen:
  - TypeScript·TSX 의 문서 주석이나 인라인 주석 문구를 추가·수정·번역하거나 검토할 때
tags: comments, korean, purpose
---

## Write Concise Korean Comments About Purpose and Constraints

**Impact: MEDIUM (코드 동작을 옮겨 적지 않고 의도와 제약에 주석을 모읍니다)**

주석은 한국어로 쓰고 목적, 제약, 부수효과를 짧게 적습니다.
코드가 무엇을 하는지 옮겨 적기보다 왜 넣었고 무엇을 조심해야 하는지를 먼저 씁니다.

기술 용어와 식별자는 영어로 섞어도 됩니다.
다만 주석 본문이 전부 영어이면 한국어 주석으로 인정하지 않습니다.
새로 넣거나 고친 문서 주석에는 그 선언의 목적이나 제약을 설명하는 한국어 구절이 있어야 합니다.
다른 필드 주석이 한국어라고 영어뿐인 헤더 주석을 대신 통과시키지 않습니다.

**Incorrect (영문이거나 방법만 늘어놓는 장황한 설명):**

```ts
/**
 * This function sorts rule refs and returns the result.
 */

/**
 * route-local entry tree props
 */
```

**Correct (한글, 명사형, 의도 중심 설명):**

```ts
/**
 * 중복 제거 후 규칙 경로 정렬
 */

/**
 * route-local 엔트리 트리 입력 계약
 */
```
