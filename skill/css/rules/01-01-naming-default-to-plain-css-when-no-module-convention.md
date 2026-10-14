---
title: Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules
titleKo: 프로젝트 표준이 없으면 CSS Modules 대신 일반 CSS를 씁니다
impact: MEDIUM
impactDescription: 클래스 이름이 전역에서 고유해야 범위_식별자로 소유자를 되짚을 수 있습니다
appliesWhen:
  - 표준이 정해지지 않은 상태에서 스타일시트 방식(일반 CSS, CSS Modules)을 고르거나 `.module.css`나 `styles.*`로 옮길 때
  - 제외: 기존 일반 CSS 클래스 이름만 바꾸는 경우
tags: naming, css-modules, ownership
---

## Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules

**Impact: MEDIUM (클래스 이름이 전역에서 고유해야 범위_식별자로 소유자를 되짚을 수 있습니다)**

별도 합의가 없으면 일반 `*.css`와 전역에서 고유한 클래스 이름을 씁니다.
`.module.css`를 새로 만들거나 클래스를 `styles.foo`처럼 객체 속성으로 참조하지 않습니다.
CSS Modules가 프로젝트의 공식 표준이고 별도의 이름 규칙이 있으면 그 규칙을 따릅니다.

**Incorrect 1 (프로젝트 표준이 없는데도 CSS Modules를 기본처럼 씁니다):**

<<< ../examples/naming-default-to-plain-css-when-no-module-convention/01-incorrect-1.tsx

<<< ../examples/naming-default-to-plain-css-when-no-module-convention/01-incorrect-2.css

**Correct 1 (기본으로 일반 CSS와 전역 고유 클래스 이름을 씁니다):**

<<< ../examples/naming-default-to-plain-css-when-no-module-convention/02-correct-1.tsx

<<< ../examples/naming-default-to-plain-css-when-no-module-convention/02-correct-2.css
