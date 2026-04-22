---
title: Keep Pages, Layouts, Components, and Content in Native Directories
impact: HIGH
impactDescription: keeps Astro-specific responsibilities obvious before reading implementation details
tags: structure, layouts, content
---

## Keep Pages, Layouts, Components, and Content in Native Directories

**Impact: HIGH (keeps Astro-specific responsibilities obvious before reading implementation details)**

`src/pages`, `src/layouts`, `src/components`, `src/content`는 각자 역할이 다릅니다. page와 layout과 reusable component와 content source를 한 디렉터리 트리 안에 섞지 말고, Astro 기본 디렉터리 의미를 그대로 살리는 편이 탐색과 유지보수에 유리합니다.

**Incorrect (페이지, 레이아웃, 콘텐츠 소스를 하나의 feature 트리 안에 섞음):**

```text
src/
  feature/
    blog/
      BlogLayout.astro
      page.astro
      posts/
        hello-world.md
```

**Correct (Astro 고유 디렉터리 의미를 살려 ownership을 분리):**

```text
src/
  pages/
    blog/
      [slug].astro
  layouts/
    BlogLayout.astro
  components/
    blog/
      BlogHeader.astro
  content/
    blog/
      hello-world.md
```
