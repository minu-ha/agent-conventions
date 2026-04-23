---
title: Align Feature Page Files and `ft_*` Surface Classes with Route Role
impact: HIGH
impactDescription: keeps Astro feature page files, CSS owners, and route semantics aligned without bloated or ambiguous page namespaces
tags: naming, features, css, route-role
---

## Align Feature Page Files and `ft_*` Surface Classes with Route Role

**Impact: HIGH (keeps Astro feature page files, CSS owners, and route semantics aligned without bloated or ambiguous page namespaces)**

`src/features/<feature>/*-page.astro` 파일은 route role이 드러나는 owner 이름을 사용하고, 그 screen surface CSS는 같은 owner를 `ft_*` scope로 유지합니다. list, hub, directory screen은 route 이름 그대로 `recent-page.astro`, `posts-page.astro`, `notes-page.astro`, `tags-page.astro`처럼 두고, surface class는 `ft_recent__*`, `ft_posts__*`, `ft_notes__*`, `ft_tags__*`처럼 짧게 둡니다. detail screen은 `post-detail-page.astro`, `note-detail-page.astro`처럼 singular + `detail-page`를 사용하고, surface class는 `ft_postDetail__*`, `ft_noteDetail__*`처럼 singular + `Detail`을 사용합니다. 홈은 `home-page.astro`와 `ft_home__*`를 사용합니다.

복수형 family 아래의 단일 resource page도 URL contract가 `src/pages/tags/[tag]/index.astro`처럼 singular resource를 가리킨다면 `tag-page.astro`와 `ft_tag__*`처럼 route resource owner를 그대로 유지합니다. 반대로 class에 `Page`를 넣거나 `loc_*`를 만들어 feature screen ownership을 쪼개지 않습니다.

**Incorrect (파일명과 screen surface owner가 route role과 어긋남):**

```txt
home-page.astro -> loc_homePage__grid
posts-page.astro -> ft_postsPage__root
post-detail-page.astro -> ft_posts__body
tag-page.astro -> ft_tags__root
```

**Correct (파일명과 `ft_*` surface owner가 route role에 맞게 정렬됨):**

```txt
home-page.astro -> ft_home__grid
recent-page.astro -> ft_recent__root
posts-page.astro -> ft_posts__root
post-detail-page.astro -> ft_postDetail__body
notes-page.astro -> ft_notes__root
note-detail-page.astro -> ft_noteDetail__meta
tags-page.astro -> ft_tags__list
tag-page.astro -> ft_tag__root
```
