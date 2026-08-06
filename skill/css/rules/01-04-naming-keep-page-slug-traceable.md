---
title: Keep Page Slugs Traceable to Their Screen
titleKo: `pg_*` 식별자만 보고 어느 화면인지 알 수 있게 짓습니다
impact: MEDIUM
impactDescription: 클래스명만 보고 어느 화면의 클래스인지 되짚습니다
appliesWhen:
  - `pg_*` 소유자의 클래스 식별자를 새로 만들거나 이름을 바꿀 때
  - 같은 이름 컴포넌트가 여러 화면에 생겨 식별자를 구분해야 할 때
tags: slug, page-scope, traceability
---

## Keep Page Slugs Traceable to Their Screen

**Impact: MEDIUM (클래스명만 보고 어느 화면의 클래스인지 되짚습니다)**

`pg_*` 식별자만 보고 어느 화면의 것인지 알 수 있어야 합니다.
어떤 파일이 화면 소유인지는 활성화된 프레임워크 규약이 판단합니다.
CSS는 그 화면의 이름을 식별자에 그대로 적습니다.

- 화면 뼈대의 식별자는 그 화면의 라우트 세그먼트나 폴더 이름과 같은 낱말입니다.
  `shell`, `page`, `content`처럼 어느 화면에나 붙는 역할 낱말은 식별자가 아닙니다.
- `[id]`처럼 값이 런타임에 정해지는 동적 세그먼트는 그 화면이 하는 일로 바꿔 씁니다.
  `posts/[id]` 화면이면 `[id]`를 `detail`로 바꿔 `pg_postsDetail`입니다.
- 화면 안의 컴포넌트는 자기 이름만 식별자로 씁니다.
- 라우트 경로나 폴더 이름에 없는 줄임말은 쓰지 않습니다.
  `pg_prd__root`가 아니라 `pg_products__root`입니다.
- `wg_*`, `ui_*`는 각자의 식별자 규칙을 따릅니다.

부모 식별자를 미리 붙이지 않습니다.
충돌이 실제로 생겼을 때만 최소한으로 덧붙입니다.
미리 붙이면 깊이만큼 식별자가 자라서 충돌을 걱정하기 전에 읽기 어려워집니다.

**Incorrect (화면 이름이 아닌 식별자):**

```txt
pg_shell__body    <- 역할 낱말이라 어느 화면인지 안 나옴
pg_doc__content   <- 라우트에 없는 줄임말
pg_x__root        <- 되짚을 이름이 없음
```

**Incorrect (충돌이 없는데도 부모 식별자를 미리 붙임):**

```txt
pg_detailSalesTrendPanelOverviewSection__root
pg_detailSalesTrendPanelSummaryBand__root
```

**Correct (뼈대는 화면 식별자, 컴포넌트는 자기 식별자):**

```txt
posts index page   -> pg_postsIndex__root
posts detail page  -> pg_postsDetail__body
document shell     -> pg_document__body

overview section   -> pg_overviewSection__root
summary band       -> pg_summaryBand__root
```

**Correct (같은 식별자가 실제로 두 화면에 생겼을 때만 구분):**

```txt
pg_detailOverviewSection__root
pg_indexOverviewSection__root
```
