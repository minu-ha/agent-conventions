---
title: Preserve Route Slug Traceability
impact: HIGH
impactDescription: keeps route-scoped class namespaces readable back to the route hierarchy they belong to
tags: slug, route-scope, traceability
---

## Preserve Route Slug Traceability

**Impact: HIGH (keeps route-scoped class namespaces readable back to the route hierarchy they belong to)**

활성화된 route/framework skill이 `rt_*` owner를 선택했다면, CSS는 그 owner slug를 route까지 다시 추적할 수 있게 유지합니다. CSS skill은 어떤 파일이 route-owned인지 결정하지 않고, 이미 선택된 route owner가 클래스명에서 흐려지지 않게 지키는 역할을 합니다.

기본 판단:

- `rt_*` slug는 짧음보다 추적 가능성을 우선합니다.
- 전체 folder path를 모두 쓰지는 않아도, route family와 screen role은 읽혀야 합니다.
- 팀이 공유하는 route map이 없는 opaque acronym은 피합니다.
- `wg_*`, `ui_*`, `loc_*`는 각 owner scope의 naming style을 따릅니다.
- document, local helper, reusable widget의 owner 판단은 companion framework skill의 소유권 규칙을 우선합니다.

**Incorrect (의미가 약하거나 계층 순서가 흐려진 slug):**

```txt
rt_shell__body
rt_pageChrome__main
rt_doc__content
rt_x__root
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
