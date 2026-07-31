---
title: Preserve Route Slug Traceability
titleKo: route slug 추적성 유지
impact: HIGH
impactDescription: 화면 범위 class namespace를 소속 화면으로 거슬러 읽을 수 있게 유지합니다
appliesWhen:
  - `pg_*` owner의 class slug를 새로 만들거나 이름을 바꿀 때
  - 같은 이름 component가 여러 화면에 생겨 slug를 구분해야 할 때
tags: slug, page-scope, traceability
---

## Preserve Route Slug Traceability

**Impact: HIGH (화면 범위 class namespace를 소속 화면으로 거슬러 읽을 수 있게 유지합니다)**

`pg_*` slug는 소속 화면까지 다시 추적할 수 있어야 합니다.
CSS skill은 어떤 파일이 화면 소유인지 결정하지 않고, 이미 선택된 owner가 클래스명에서 흐려지지 않게 지킵니다.

기본 판단:

- 화면 shell slug는 route 이름을 씁니다. route family와 screen role이 읽혀야 합니다.
- 화면 내부 component slug는 자기 component 이름만 씁니다.
- 팀이 공유하는 route map이 없는 opaque acronym은 피합니다.
- `wg_*`, `ui_*`는 각 owner scope의 naming style을 따릅니다.

부모 이름을 미리 붙이지 않습니다.
충돌이 실제로 생겼을 때만 최소 범위로 덧붙입니다.
미리 붙이면 깊이에 따라 slug가 계속 자라서 충돌을 걱정하기 전에 읽기가 무너집니다.

**Incorrect (의미가 약하거나 계층 순서가 흐려진 slug):**

```txt
pg_shell__body
pg_doc__content
pg_x__root
```

**Incorrect (충돌이 없는데도 부모 이름을 미리 붙임):**

```txt
pg_detailSpikePatternPanelOverviewSection__root
pg_detailSpikePatternPanelSummaryBand__root
```

**Correct (shell은 route 이름, component는 자기 이름):**

```txt
posts index route  -> pg_postsIndex__root
posts detail route -> pg_postsDetail__body
document shell     -> pg_document__body

overview section   -> pg_overviewSection__root
summary band       -> pg_summaryBand__root
```

**Correct (같은 이름이 실제로 두 화면에 생겼을 때만 구분):**

```txt
pg_detailOverviewSection__root
pg_indexOverviewSection__root
```
