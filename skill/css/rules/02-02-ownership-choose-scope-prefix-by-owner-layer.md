---
title: Choose the Scope Prefix by Owner Layer
titleKo: 범위 접두사는 소유 레이어를 따릅니다
impact: MEDIUM-HIGH
impactDescription: 접두사를 소유 레이어로 정하면 이름만 보고 어느 레이어 것인지 압니다
appliesWhen:
  - 새 CSS 파일을 만들면서 `pg_`, `wg_`, `ui_` 중 하나를 고를 때
  - 소유자의 레이어가 바뀌어 접두사를 옮길 때
reviewWith: >-
  ownership-give-each-file-one-scope-slug, ownership-use-foreign-classes-only-under-your-own-root
tags: ownership, scope, prefix
---

## Choose the Scope Prefix by Owner Layer

**Impact: MEDIUM-HIGH (접두사를 소유 레이어로 정하면 이름만 보고 어느 레이어 것인지 압니다)**

범위 접두사는 그 CSS 파일 소유자가 속한 **레이어**를 말합니다.
레이어는 파일의 최상위 폴더로 이미 정해져 있습니다.
폴더 깊이는 보지 않습니다.

| 접두사 | 최상위 폴더 | 소유 레이어 |
| --- | --- | --- |
| `pg_` | `src/page` | 화면을 아는 화면 뼈대와 컴포넌트 |
| `wg_` | `src/component/widget` | 도메인은 알고 화면은 모르는 컴포넌트 |
| `ui_` | `src/component/ui` | 도메인도 화면도 모르는 컴포넌트 |

`pg_`는 화면 뼈대와 그 아래 컴포넌트를 함께 덮습니다.
뼈대는 식별자가 라우트 이름과 같아서 접두사를 따로 나누지 않아도 컴포넌트와 구분됩니다.

- 위젯 내부 부품이 소유자 폴더 안에 있어도 최상위가 `src/component/widget`이라 `wg_`입니다.
- 사용 횟수는 레이어를 가르지 않습니다.
  재사용을 예상해서 미리 `wg_`로 올리지도, 한 화면만 쓴다고 `pg_`로 내리지도 않습니다.
- 소유자의 레이어가 바뀌면 접두사도 함께 옮깁니다.

파일이 어느 최상위 폴더에 있어야 하는지는 활성화된 프레임워크 규약이 판단하고, 접두사는 그 폴더를 그대로 따릅니다.
파일 이름의 `_` 표식도 그 규약이 정합니다.

**Incorrect (최상위 폴더 대신 하위 폴더를 보고 `widget` 부품을 화면 범위로 내립니다):**

```txt
component/widget/chart/_wg-chart-header.css
  pg_chartHeader__root
```

**Incorrect (`src/page` 아래 파일에 재사용 예상으로 `wg_`를 붙입니다):**

```txt
page/detail/_pg-sales-trend-panel.css
  wg_salesTrendPanel__root
```

**Correct (소유 레이어대로 접두사를 붙입니다):**

```txt
page/detail/pg-detail.css
  pg_detail__root

page/detail/_pg-sales-trend-panel.css
  pg_salesTrendPanel__root

component/widget/chart/_wg-chart-header.css
  wg_chartHeader__root

component/ui/button/ui-button.css
  ui_button__root
```
