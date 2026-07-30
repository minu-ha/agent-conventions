---
title: Use Domain-specific Dynamic Segment Names
titleKo: 동적 세그먼트는 도메인 이름으로
impact: MEDIUM-HIGH
impactDescription: 파일 수준과 router API 안에서 route 파라미터가 스스로 설명되게 함
tags: params, dynamic-segments, naming
---

## Use Domain-specific Dynamic Segment Names

**Impact: MEDIUM-HIGH (파일 수준과 router API 안에서 route 파라미터가 스스로 설명되게 함)**

필수 path param은 `{$param}`, 선택 path param은 `{-$param}` 문법을 사용하고,
param 이름은 도메인 의미가 드러나는 명사를 씁니다.
generic `id`, `x` 같은 이름은 파일 구조만 봐서는 의미를 알 수 없으므로 피합니다.

**Incorrect (generic param 이름을 사용):**

```txt
users.{$id}.index.tsx
posts.{-$x}.tsx
```

**Correct (도메인 의미가 드러나는 이름을 사용):**

```txt
users.{$userId}.index.tsx
posts.{$postId}.edit.index.tsx
filters.{-$tab}.tsx
```
