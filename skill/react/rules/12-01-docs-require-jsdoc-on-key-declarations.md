---
title: Require Doc Comments on React Hooks, Handlers, and Key Declarations
titleKo: React의 주요 경계 선언에 JSDoc 주석을 붙입니다
impact: MEDIUM
impactDescription: 공통 문서화 기준에 React 전용 선언을 추가해 누락을 막습니다
appliesWhen:
  - 쿼리, 뮤테이션이나 읽어도 의도가 안 보이는 핸들러, 이펙트를 추가, 변경할 때
  - 내보낸 보조 함수, 훅, 스토어 선언을 추가, 변경할 때
requiresSelected: typescript/docs-require-header-jsdoc-on-key-declarations
reviewWith: typescript/types-document-custom-types-and-shapes
tags: docs, handlers, effects
---

## Require Doc Comments on React Hooks, Handlers, and Key Declarations

**Impact: MEDIUM (공통 문서화 기준에 React 전용 선언을 추가해 누락을 막습니다)**

`typescript/docs-require-header-jsdoc-on-key-declarations`의 필수 대상에 아래 React 선언을 추가합니다.

| 추가 대상 | 조건 |
| --- | --- |
| 합성 컴포넌트 | 공개 부품 |
| `useEffect` | 정리 함수가 있거나 의존성이 둘 이상임 |
| 이벤트 핸들러 | 화면을 이동하거나 쿼리를 무효화함. 동작이 하나뿐이어도 포함합니다 |

**Incorrect 1 (주요 경계 선언에 의도 설명이 없습니다):**

<<< ../examples/docs-require-jsdoc-on-key-declarations/01-incorrect.ts

**Correct 1 (선언 의도를 바로 위에 여러 줄 블록으로 적습니다):**

<<< ../examples/docs-require-jsdoc-on-key-declarations/02-correct.ts
