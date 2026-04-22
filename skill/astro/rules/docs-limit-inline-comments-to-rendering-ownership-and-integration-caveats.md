---
title: Limit Inline Comments to Rendering, Ownership, and Integration Caveats
impact: MEDIUM
impactDescription: keeps Astro comments focused on the constraints readers are most likely to miss
tags: docs, comments, rendering, caveats
---

## Limit Inline Comments to Rendering, Ownership, and Integration Caveats

**Impact: MEDIUM (keeps Astro comments focused on the constraints readers are most likely to miss)**

Astro의 inline comment는 rendering mode, serialization, feature ownership handoff, adapter requirement, integration caveat처럼 없으면 오해되기 쉬운 제약에만 남깁니다. frontmatter 안에서는 `//` 주석을 사용하고, template 내부 설명이 필요하면 HTML comment로 남기기보다 frontmatter나 support module로 경계를 옮겨 문서화합니다. 변수명이나 template 구조를 그대로 읽어주는 주석은 남기지 않습니다.

**Incorrect (자명한 동작을 그대로 설명하는 주석):**

```astro
---
const tab = Astro.url.searchParams.get("tab") ?? "all";
// 탭을 가져온다
const pageData = await getPostListPageData({ tab });
// 데이터를 불러온다
---
```

**Correct (rendering/ownership 제약만 짧게 설명):**

```astro
---
export const prerender = false;

// 쿠키 기반 개인화가 있어 build-time prerender로 고정하면 안 됨.
const tab = Astro.url.searchParams.get("tab") ?? "all";

// route adapter는 param 해석까지만 맡고 실제 화면 조립은 feature entry로 넘김.
const pageData = await getPostListPageData({ tab });
---
```
