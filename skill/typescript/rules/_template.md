---
title: Rule Title Here
impact: MEDIUM
impactDescription: 선택적 영향도 설명
appliesWhen: 이 rule을 선택해야 하는 변경 surface와 evidence를 한 문장으로 설명
tags: tag1, tag2
---

## Rule Title Here

**Impact: MEDIUM (선택적 영향도 설명)**

규칙의 핵심과 이유를 짧고 분명하게 설명합니다.

규범과 예외는 이 지점까지 완결합니다. 아래에는 `Incorrect`/`Correct` label, fenced code, 빈 줄만 두며 예시가 여러 개면 Incorrect를 먼저 모두 배치합니다.

관련 rule을 함께 재평가해야 할 때만 frontmatter에 `reviewWith: local-rule-id, companion-skill/cross-rule-id`를 추가하고, 대상이 없으면 key를 두지 않습니다.

**Incorrect (무엇이 문제인지 설명):**

```ts
// 나쁜 예시
```

**Correct (무엇이 좋아졌는지 설명):**

```ts
// 좋은 예시
```
