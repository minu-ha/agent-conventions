---
title: Preserve Route Slug Traceability
impact: HIGH
impactDescription: keeps route-scoped class namespaces readable back to the route hierarchy they belong to
tags: slug, route-scope, traceability
---

## Preserve Route Slug Traceability

**Impact: HIGH (keeps route-scoped class namespaces readable back to the route hierarchy they belong to)**

이 규칙은 `rt_*` route scope의 slug를 다룹니다. Astro route-owned screen, route-local support stylesheet, pages-local document helper는 모두 `rt_*` owner를 사용합니다. `rt_*` slug는 길이보다 추적 가능성을 우선하고, route role이나 document shell 역할을 읽을 수 있게 유지합니다. 꼭 전체 folder path를 다 적을 필요는 없지만, route family와 screen role을 다시 찾을 수 있는 수준의 의미는 남겨 둡니다.

이 route slug 규칙을 `wg_*`, `ui_*`, `loc_*` 같은 다른 scope의 owner slug에 그대로 덮어쓰지 않습니다. reusable block, primitive, local helper는 각자의 owner naming style을 따르되, routed page와 document shell의 main surface는 `rt_*` traceability를 우선합니다.

너무 짧아 의미가 완전히 사라지거나, 계층 순서가 뒤섞이면 클래스명만 봐서는 어느 route 소유인지 추적하기 어려워집니다.

**Incorrect (의미가 약하거나 계층 순서가 흐려진 slug):**

```txt
rt_shell__body
rt_pageChrome__main
rt_doc__content
rt_pi__root
```

**Correct (도메인 의미와 계층 순서가 보존된 slug):**

```txt
posts index route -> rt_postsIndex
posts detail route -> rt_postsDetail
document shell -> rt_document
rt_postsIndex__root
rt_postsDetail__body
rt_document__body
```
