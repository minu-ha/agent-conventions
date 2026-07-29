---
title: Use Domain-specific Dynamic Segment Names
impact: MEDIUM-HIGH
impactDescription: keeps route params self-explanatory at the file level and inside router APIs
tags: params, dynamic-segments, naming
---

## Use Domain-specific Dynamic Segment Names

**Impact: MEDIUM-HIGH (keeps route params self-explanatory at the file level and inside router APIs)**

필수 path param은 `{$param}`,
선택 path param은 `{-$param}` 문법을 사용하고,
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
