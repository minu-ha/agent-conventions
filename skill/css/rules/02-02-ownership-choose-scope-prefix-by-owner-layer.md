---
title: Choose the Scope Prefix by Owner Layer
titleKo: 범위 접두사는 소유 레이어를 따릅니다
impact: MEDIUM
impactDescription: 클래스 접두사로 소유 레이어를 구분합니다
appliesWhen:
  - 새 CSS 파일을 만들면서 `pg_`, `wg_`, `ui_` 중 하나를 고를 때
  - 소유자의 레이어가 바뀌어 접두사를 옮길 때
reviewWith: >-
  ownership-give-each-file-one-scope-slug, ownership-use-foreign-classes-only-under-your-own-root
tags: ownership, scope, prefix
---

## Choose the Scope Prefix by Owner Layer

**Impact: MEDIUM (클래스 접두사로 소유 레이어를 구분합니다)**

범위 접두사는 CSS 파일 소유자의 **레이어**를 나타냅니다. 폴더 깊이가 아니라 최상위 폴더로 정합니다.

| 접두사 | 최상위 폴더 | 소유 레이어 |
| --- | --- | --- |
| `pg_` | `src/page` | 화면을 아는 라우트 진입 파일과 컴포넌트 |
| `wg_` | `src/component/widget` | 도메인은 알고 화면은 모르는 컴포넌트 |
| `ui_` | `src/component/ui` | 도메인도 화면도 모르는 컴포넌트 |

라우트 진입 파일과 부품은 모두 `pg_`를 씁니다.
진입 파일은 라우트와 같은 식별자로 구분합니다.
`widget` 내부 부품도 최상위 폴더가 `src/component/widget`이면 `wg_`입니다.

사용 횟수로 레이어를 바꾸지 않습니다.
재사용을 예상해 미리 `wg_`로 올리거나 한 화면만 쓴다고 `pg_`로 내리지 않습니다.
소유자의 레이어가 바뀌면 접두사도 함께 바꿉니다.
최상위 폴더의 선택과 파일 이름의 `_` 표식은 활성화된 프레임워크 규약이 정합니다.

**Incorrect 1 (최상위 폴더 대신 사용 횟수와 재사용 예상을 보고 접두사를 고릅니다):**

```txt
page/product-detail/_pg-product-table-section.css
  wg_productTableSection__root

component/widget/chart-card/_wg-chart-card-header.css
  pg_chartCard__header
```

**Correct 1 (소유 레이어대로 접두사를 붙입니다):**

```txt
page/product-detail/pg-product-detail.css
  pg_productDetail__root

page/product-detail/_pg-product-table-section.css
  pg_productTableSection__root

component/widget/chart-card/_wg-chart-card-header.css
  wg_chartCard__header

component/ui/button/ui-button.css
  ui_button__root
```
