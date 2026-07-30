---
title: Use Domain-specific Dynamic Segment Names
titleKo: 동적 세그먼트는 도메인 이름으로
impact: MEDIUM-HIGH
impactDescription: 파일 트리와 Astro.params 안에서 route 파라미터가 스스로 설명되게 함
tags: params, dynamic-routes, naming
---

## Use Domain-specific Dynamic Segment Names

**Impact: MEDIUM-HIGH (파일 트리와 Astro.params 안에서 route 파라미터가 스스로 설명되게 함)**

`[param].astro`와 `[...param].astro`의 이름은 도메인 의미가 드러나는 명사를 사용합니다.
실제 slug를 표현하는 경우가 아니라면 generic `id`, `path`, `value` 이름은 피하고,
파일 경로만 봐도 해당 param이 무엇을 가리키는지 알 수 있게 둡니다.

**Incorrect (generic param 이름으로 의미를 숨김):**

```text
src/pages/posts/[id].astro
src/pages/docs/[...path].astro
src/pages/authors/[value].astro
```

**Correct (param 이름이 파일 레벨에서 바로 의미를 드러냄):**

```text
src/pages/posts/[postId].astro
src/pages/docs/[...docsPath].astro
src/pages/authors/[author].astro
src/pages/blog/[slug].astro
```
