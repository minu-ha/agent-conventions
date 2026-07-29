---
title: Write Concise Korean Comments About Purpose and Constraints
impact: MEDIUM
impactDescription: keeps comments focused on intent and constraints instead of narrating code mechanics
appliesWhen: TypeScript/TSX의 JSDoc이나 inline comment 문구를 추가·수정·번역하거나 리뷰한다.
tags: comments, korean, purpose
---

## Write Concise Korean Comments About Purpose and Constraints

**Impact: MEDIUM (keeps comments focused on intent and constraints instead of narrating code mechanics)**

주석은 한글로 작성하고, 목적, 제약, 부작용 중심으로 간결하게 적습니다. `@api`, `@event`, `@watch`, `@helper`, `@summary`, `@field` 문장은 명사형 종결이나 개조식 표현을 기본으로 하며, 코드 동작 설명보다 도입 이유와 제약 설명을 우선합니다.

기술 용어와 identifier는 영문으로 섞을 수 있지만 annotation 본문 전체가 ASCII 또는 영문 label이면 한글 주석으로 인정하지 않습니다.
새로 추가하거나 바꾼 각 annotation body에는 그 선언의 목적이나 제약을 설명하는 한글 구절이 있어야 합니다.
다른 `@field`가 한글이어도 영문-only `@summary`를 대신 통과시키지 않습니다.

**Incorrect (영문 또는 How 중심의 장황한 설명):**

```ts
/**
 * @summary This function sorts rule refs and returns the result.
 */

/**
 * @summary route-local entry tree props
 */
```

**Correct (한글, 명사형, 의도 중심 설명):**

```ts
/**
 * @summary 중복 제거 후 규칙 경로 정렬
 */

/**
 * @summary route-local 엔트리 트리 입력 계약
 */
```
