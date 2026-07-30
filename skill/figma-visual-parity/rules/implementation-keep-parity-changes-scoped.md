---
title: Keep Parity Changes Scoped
titleKo: parity 변경은 범위 안에 두기
impact: HIGH
impactDescription: visual polish 중 불필요한 구조 리팩터링과 shared surface 변경을 막음
tags: implementation, scope, shared
---

## Keep Parity Changes Scoped

**Impact: HIGH (visual polish 중 불필요한 구조 리팩터링과 shared surface 변경을 막음)**

Visual parity 작업은 Figma와 현재 화면의 차이를 줄이는 데 집중합니다.
불필요한 구조 리팩터링, API/data shaping 변경, shared component/style 변경을 기본값으로 삼지 않습니다.
scope 밖 shared surface 변경이 필요하면 왜 필요한지 먼저 보고하고 승인을 받습니다.

**Incorrect (스타일 보정 중 구조를 크게 바꿈):**

```md
scope: src/pages/detail
작업: 공용 Button variant, 전역 table CSS, API response mapper까지 함께 리팩터링.
```

**Correct (scope 안에서 parity 차이를 먼저 줄임):**

```md
scope: src/pages/detail
작업: detail-local wrapper와 CSS token 조정으로 Figma spacing/color/radius를 맞춤.
공용 Button 변경 필요성은 별도 보고.
```
