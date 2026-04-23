---
title: Use `ft_` Scope for Feature-owned Page Surfaces
impact: CRITICAL
impactDescription: makes Astro feature pages and their CSS surfaces line up with the owning route role instead of inventing ad-hoc local namespaces
tags: naming, feature-scope, astro, ownership
---

## Use `ft_` Scope for Feature-owned Page Surfaces

**Impact: CRITICAL (makes Astro feature pages and their CSS surfaces line up with the owning route role instead of inventing ad-hoc local namespaces)**

`src/features/<feature>/*-page.astro`와 그 page를 직접 지원하는 feature-private markup/CSS는 `ft_*`를 기본 scope로 사용합니다. list, hub, directory screen은 route 이름 그대로 `ft_recent__*`, `ft_posts__*`, `ft_notes__*`, `ft_tags__*`처럼 짧게 두고, detail screen은 `ft_postDetail__*`, `ft_noteDetail__*`처럼 singular + `Detail`을 사용합니다. 홈은 `ft_home__*`를 사용하고, 복수형 family 아래의 단일 resource page는 `ft_tag__*`처럼 route resource owner를 그대로 사용합니다. 클래스명에는 `Page`를 넣지 않습니다.

feature-private 파일도 같은 page surface owner를 설명한다면 `loc_*`로 새 namespace를 만들지 않고 같은 `ft_*` owner를 유지합니다. `loc_*`는 truly local helper가 자기 독립 owner를 가질 때만 사용합니다.

**Incorrect (page surface인데 `loc_*`나 `Page` suffix로 흐려짐):**

```txt
loc_homePage__grid
loc_tagDirectoryList__root
ft_postsPage__root
ft_noteList__root
```

**Correct (route role이 보이는 `ft_*` owner로 정리):**

```txt
ft_home__grid
ft_recent__root
ft_posts__root
ft_postDetail__body
ft_notes__root
ft_noteDetail__meta
ft_tags__list
ft_tag__root
```
