---
title: Write Concise Korean Comments About Purpose and Risks
impact: MEDIUM
impactDescription: keeps backend comments focused on intent, constraints, and risk instead of narrating mechanics
tags: comments, korean, purpose
---

## Write Concise Korean Comments About Purpose and Risks

**Impact: MEDIUM (keeps backend comments focused on intent, constraints, and risk instead of narrating mechanics)**

주석은 한글로 작성하고, 목적, 제약, 부작용, 위험 중심으로 간결하게 적습니다. `@summary`와 `@description` 문장은 명사형 종결이나 개조식 표현을 기본으로 하며, `~합니다`, `~이다` 같은 서술형 종결은 피합니다.

**Incorrect (서술형, How 중심, 장황한 설명):**

```ts
/**
 * @summary id로 사용자를 찾아서 없으면 예외를 던집니다.
 */
```

**Correct (한글, 명사형, Why 중심 설명):**

```ts
/**
 * @summary 사용자 단건 조회 - 미존재 시 NotFoundException 발생
 */
```
