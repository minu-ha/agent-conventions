---
title: Prefer Children Over Render Props for Static Composition
titleKo: 정적 조립에서는 렌더 프롭 대신 `children`을 씁니다
impact: MEDIUM
impactDescription: 실행 문맥이 필요 없는 조립을 JSX 구조로 바로 읽을 수 있습니다
appliesWhen:
  - 공용 컴포넌트에 헤더, 푸터, 동작 같은 정적 슬롯을 추가, 변경할 때
  - 렌더 프롭을 추가, 변경하는데 실행 환경 데이터 주입이 꼭 필요한지 불분명할 때
  - `ReactNode` 슬롯이나 렌더 함수 계약에 이름을 붙이거나 바꿀 때
tags: strategy, composition, components
---

## Prefer Children Over Render Props for Static Composition

**Impact: MEDIUM (실행 문맥이 필요 없는 조립을 JSX 구조로 바로 읽을 수 있습니다)**

상태 없는 합성으로 충분한 공용 컴포넌트는 렌더 프롭보다 `children`을 우선합니다.

```mermaid
flowchart LR
	q1{"부모가 항목, 순번, 상태 같은<br>실행 문맥을 자식에게 넘기는가?"} -- 아니요 --> r1("children 과<br>네임스페이스 슬롯 부품")
	q1 -- 예 --> r2("renderHeader, renderFooter<br>같은 렌더 프롭")
```

| 별도 이름이 필요한 계약 | 이름 |
| --- | --- |
| `ReactNode` 값 | `<Owner>Slot` |
| 실행 문맥을 받아 `ReactNode`를 만드는 함수 | `<Owner>Renderer` |
| 한 번만 쓰는 익명 형태 | 접미사를 붙이려고 새 타입을 만들지 않습니다 |

**Incorrect 1 (정적인 구조를 렌더 프롭으로 조립합니다):**

<<< ../examples/strategy-prefer-children-over-render-props/01-incorrect.tsx

**Correct 1 (부품이 `children`으로 사용처가 넣을 자리를 엽니다):**

<<< ../examples/strategy-prefer-children-over-render-props/02-correct.tsx

**Correct (부품 계약, 진입 파일, 화면 조립을 파일마다 나눕니다):**

<<< ../examples/strategy-prefer-children-over-render-props/03-correct-1.ts

<<< ../examples/strategy-prefer-children-over-render-props/03-correct-2.tsx

<<< ../examples/strategy-prefer-children-over-render-props/03-correct-3.tsx
