---
title: Choose the Scope Prefix by Reuse Range
titleKo: 재사용 범위 기준 scope 접두사 선택
impact: HIGH
impactDescription: 폴더 경로가 아니라 재사용 범위로 접두사를 정하게 해서 이름만 보고 어디서 쓰이는지 알게 합니다
appliesWhen:
  - 새 CSS 파일을 만들며 `pg_`·`wg_`·`ui_` 중 하나를 고를 때
  - 소유자의 재사용 범위가 바뀌어 접두사를 옮길 때
reviewWith: >-
  ownership-give-each-file-one-scope-slug, ownership-use-foreign-classes-only-under-your-own-root
tags: ownership, scope, prefix
---

## Choose the Scope Prefix by Reuse Range

**Impact: HIGH (폴더 경로가 아니라 재사용 범위로 접두사를 정하게 해서 이름만 보고 어디서 쓰이는지 알게 합니다)**

scope 접두사는 폴더 경로가 아니라 그 CSS 파일 소유자의 **재사용 범위**를 가리킵니다.

| 접두사 | 재사용 범위 |
| --- | --- |
| `pg_` | 한 화면 안에서만 쓰이는 shell과 컴포넌트 |
| `wg_` | 여러 화면이 재사용하는 widget과 그 part |
| `ui_` | 도메인 지식이 없는 primitive 컴포넌트와 그 part |

`pg_`는 화면 shell과 그 아래 컴포넌트를 함께 덮습니다.
shell은 slug가 route 이름과 같아서 따로 표시하지 않아도 구분됩니다.

- 폴더가 아니라 가장 가까운 공개 패키지 경계로 판정합니다.
  widget 내부 part가 `component` 폴더에 있어도 `wg_`입니다.
- 한 화면만 쓰는데 `wg_`를 붙이지 않습니다. 재사용을 예상해서 미리 올리지 않습니다.
- 여러 화면이 쓰기 시작하면 그때 `pg_`에서 `wg_`로 옮깁니다.

어떤 파일이 화면 소유인지는 활성화된 framework convention이 판단합니다.

**Incorrect (widget 내부 part를 폴더 이름만 보고 화면 scope로 내림):**

```txt
widget/chart/component/wg-chart-header.css
  pg_chartHeader__root
```

**Incorrect (한 화면만 쓰는 컴포넌트를 재사용 예상으로 미리 `wg_`로 올림):**

```txt
page/detail/component/pg-spike-pattern-panel.css
  wg_spikePatternPanel__root
```

**Correct (재사용 범위대로 접두사를 붙임):**

```txt
page/detail/pg-detail.css
  pg_detail__root

page/detail/component/pg-spike-pattern-panel.css
  pg_spikePatternPanel__root

widget/chart/component/wg-chart-header.css
  wg_chartHeader__root

ui/button/ui-button.css
  ui_button__root
```
