---
title: Separate Feature, Local, and Route-adjacent Style Scopes
impact: HIGH
impactDescription: keeps feature-owned page styles, pages-local document styles, and truly local helper styles from mixing into the same namespace or file
tags: feature-scope, local-scope, route-scope, css-files
---

## Separate Feature, Local, and Route-adjacent Style Scopes

**Impact: HIGH (keeps feature-owned page styles, pages-local document styles, and truly local helper styles from mixing into the same namespace or file)**

feature-based Astro 프로젝트에서는 `src/features/<feature>/*-page.astro`와 그 feature-private 보조 UI가 같은 screen owner를 설명한다면 `ft_*` 스코프를 기본으로 사용합니다. 즉 `private/` 파일이라고 해서 자동으로 `loc_*`를 새로 만들지 말고, 여전히 같은 page surface를 설명한다면 `ft_posts__*`, `ft_postDetail__*`, `ft_tags__*` 같은 기존 feature owner namespace를 유지합니다. 반대로 `rt_*`는 `src/pages/_document.css`처럼 pages-local document shell이나 route-adjacent helper CSS에만 남기고, `loc_*`는 독립 owner를 가진 truly local helper 스타일일 때만 사용합니다. 서로 다른 owner 범위는 한 파일에 섞지 않습니다.

**Incorrect (feature page surface와 local helper, document shell을 한 파일/네임스페이스에 섞음):**

```txt
post.css
  ft_posts__root
  loc_postFilterDialog__root
  rt_document__content
```

**Correct (feature/page owner, document shell owner, local helper owner를 분리):**

```txt
features/post/post.css
  ft_posts__root
  ft_posts__list
  ft_posts__empty

pages/_document.css
  rt_document__body
  rt_document__content

private/post-filter-dialog.css
  loc_postFilterDialog__root
```
