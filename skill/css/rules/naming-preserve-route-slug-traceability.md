---
title: Preserve Route Slug Traceability
impact: HIGH
impactDescription: keeps route-scoped class namespaces readable back to the route hierarchy they belong to
tags: slug, route-scope, traceability
---

## Preserve Route Slug Traceability

**Impact: HIGH (keeps route-scoped class namespaces readable back to the route hierarchy they belong to)**

라우트 slug는 길이보다 추적 가능성을 우선하고, 상위에서 하위로 이어지는 라우트 트리 순서를 반영해 축약합니다. route 이름을 전부 다 적을 필요는 없고 `mission-control -> mc`, `project.content-type-builder.index -> pctbi`처럼 팀이 owner를 다시 찾을 수 있을 정도로만 줄이면 됩니다. 너무 짧아 의미가 완전히 사라지거나, 계층 순서가 뒤섞이면 클래스명만 봐서는 어느 route 소유인지 추적하기 어려워집니다.

**Incorrect (의미가 약하거나 계층 순서가 흐려진 slug):**

```txt
rt_builder__panel
rt_ctp__panel
rt_ibpct__panel
```

**Correct (도메인 의미와 계층 순서가 보존된 slug):**

```txt
mission-control -> rt_mc
project.content-type-builder -> rt_pctb
project.content-type-builder.index -> rt_pctbi
rt_mc__hero
rt_pctbi__panel
```
