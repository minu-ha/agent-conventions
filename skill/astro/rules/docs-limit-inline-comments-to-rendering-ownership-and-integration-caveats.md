---
title: Limit Inline Comments to Rendering, Ownership, and Integration Caveats
impact: MEDIUM
impactDescription: keeps Astro comments focused on the constraints readers are most likely to miss
tags: docs, comments, rendering, caveats
---

## Limit Inline Comments to Rendering, Ownership, and Integration Caveats

**Impact: MEDIUM (keeps Astro comments focused on the constraints readers are most likely to miss)**

Astro의 inline comment는 rendering mode, serialization, route ownership handoff, adapter requirement, integration caveat처럼 없으면 오해되기 쉬운 제약에만 남깁니다. frontmatter 안에서는 `//` 주석을 사용하고, template 내부 설명이 필요하면 HTML comment로 남기기보다 frontmatter나 support module로 경계를 옮겨 문서화합니다. 변수명이나 template 구조를 그대로 읽어주는 주석은 남기지 않습니다.

**Incorrect (자명한 동작을 그대로 설명하는 주석):**

```astro
---
const postEntries = await getPostEntries();
// post 목록을 가져온다
const pageProps = getPostListPageProps({ entries: postEntries, currentPage: 1 });
// props를 만든다
---
```

**Correct (rendering/ownership 제약만 짧게 설명):**

```astro
---
// route entry는 collection query와 canonical/meta handoff를 소유한다.
const postEntries = await getPostEntries();

// pagination/basePath 계산은 owner-named support helper에 맡기고 route body 흐름은 page에 남긴다.
const pageProps = getPostListPageProps({ entries: postEntries, currentPage: 1 });
---
```
