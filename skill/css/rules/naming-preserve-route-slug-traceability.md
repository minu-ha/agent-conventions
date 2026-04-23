---
title: Preserve Route-adjacent Slug Traceability
impact: HIGH
impactDescription: keeps route-scoped class namespaces readable back to the route hierarchy they belong to
tags: slug, route-scope, traceability
---

## Preserve Route-adjacent Slug Traceability

**Impact: HIGH (keeps route-scoped class namespaces readable back to the route hierarchy they belong to)**

이 규칙은 `rt_*` route-adjacent scope의 slug를 다룹니다. 현재 Astro feature-based 구조에서는 실제 screen surface를 `ft_*`가 소유하므로, `rt_*`는 `src/pages/_document.astro`, `_head.astro`, `_document.css` 같은 pages-local document helper나 route adapter 가까운 예외 owner에만 남는 경우가 많습니다. 이런 `rt_*` slug는 길이보다 추적 가능성을 우선하고, route나 document shell 역할을 읽을 수 있게 유지합니다. 꼭 모든 이름을 다 적을 필요는 없지만, `document`, `feedIndex`, `tagArchive`처럼 owner를 다시 찾을 수 있는 수준의 의미는 남겨 둡니다.

이 route-adjacent slug 규칙을 `ft_*`, `wg_*`, `ui_*`, `loc_*` 같은 다른 scope의 owner slug에 그대로 덮어쓰지 않습니다. feature page surface는 `ft_posts`, `ft_postDetail`처럼 feature naming 규칙을 따르고, component/local scope는 해당 프로젝트가 정한 owner naming style을 따르되, `rt_*`만큼은 route-adjacent traceability를 우선합니다.

너무 짧아 의미가 완전히 사라지거나, 계층 순서가 뒤섞이면 클래스명만 봐서는 어느 route 소유인지 추적하기 어려워집니다.

**Incorrect (의미가 약하거나 계층 순서가 흐려진 slug):**

```txt
rt_shell__body
rt_pageChrome__main
rt_doc__content
```

**Correct (도메인 의미와 계층 순서가 보존된 slug):**

```txt
document shell -> rt_document
feed index helper -> rt_feedIndex
tag archive helper -> rt_tagArchive
rt_document__body
rt_feedIndex__panel
```
