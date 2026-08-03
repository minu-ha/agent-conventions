---
title: Keep Page Slugs Traceable to Their Screen
titleKo: page slug의 소속 화면 추적성
impact: HIGH
impactDescription: 클래스 이름만 보고 어느 화면 소속인지 거슬러 읽을 수 있게 유지합니다
appliesWhen:
  - `pg_*` 소유자의 클래스 slug를 새로 만들거나 이름을 바꿀 때
  - 같은 이름 컴포넌트가 여러 화면에 생겨 slug를 구분해야 할 때
tags: slug, page-scope, traceability
---

## Keep Page Slugs Traceable to Their Screen

**Impact: HIGH (클래스 이름만 보고 어느 화면 소속인지 거슬러 읽을 수 있게 유지합니다)**

`pg_*` slug만 보고 어느 화면의 것인지 알 수 있어야 합니다.
어떤 파일이 화면 소유인지는 framework convention이 정하고, CSS는 그 소유가 slug에서 흐려지지 않게 지킵니다.

- 화면 shell은 page 이름을 slug로 씁니다. `pg_postsDetail`처럼 화면 계열과 역할이 읽혀야 합니다.
- 화면 안의 컴포넌트는 자기 이름만 slug로 씁니다.
- 팀이 공유하는 화면 목록에 없는 줄임말은 쓰지 않습니다.
- `wg_*`, `ui_*`는 각자의 slug 규칙을 따릅니다.

부모 slug를 미리 붙이지 않습니다.
충돌이 실제로 생겼을 때만 최소 범위로 덧붙입니다.
미리 붙이면 깊이에 따라 slug가 계속 자라서 충돌을 걱정하기 전에 읽기가 무너집니다.

**Incorrect (의미가 약하거나 계층 순서가 흐려진 slug):**

```txt
pg_shell__body
pg_doc__content
pg_x__root
```

**Incorrect (충돌이 없는데도 부모 slug를 미리 붙임):**

```txt
pg_detailSpikePatternPanelOverviewSection__root
pg_detailSpikePatternPanelSummaryBand__root
```

**Correct (shell은 page slug, 컴포넌트는 자기 slug):**

```txt
posts index page   -> pg_postsIndex__root
posts detail page  -> pg_postsDetail__body
document shell     -> pg_document__body

overview section   -> pg_overviewSection__root
summary band       -> pg_summaryBand__root
```

**Correct (같은 slug가 실제로 두 화면에 생겼을 때만 구분):**

```txt
pg_detailOverviewSection__root
pg_indexOverviewSection__root
```
