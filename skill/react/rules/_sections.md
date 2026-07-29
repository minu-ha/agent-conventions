# 섹션

이 파일은 React 컨벤션 rule의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Ownership and Boundaries (ownership)
**Impact:** CRITICAL
**Description:** Shared UI, widget, route-local 코드는 소유 경계가 분명해야 에이전트가 코드를 예측 가능하게 배치할 수
  있습니다.

## 2. Typing and Contracts (typing)
**Impact:** HIGH
**Description:** React가 제공하는 handler와 prop 계약은 선언 위치에서 바로 드러나야 하며, props와 callback 시그니처
  재사용도 React 문맥에 맞게 유지해야 합니다.

## 3. Composition Strategy (strategy)
**Impact:** HIGH
**Description:** Shared component는 single component, compound component, explicit variant 중 어떤 구조를 쓸지 먼저
  결정해야 하며, compound component는 state 없는 조립 구조에서 시작해 필요할 때 같은 public 이름을 유지한 채 stateful
  구조로 확장될 수 있어야 합니다.

## 4. Component Structure and JSX (composition)
**Impact:** HIGH
**Description:** 컴포넌트는 계약과 variant가 분명하게 드러나야 하며, JSX 안에 동작을 숨기지 않고 React 19 기준의
  컴포넌트 구조를 읽기 쉽게 유지해야 합니다.

## 5. Screen File Discipline (screen)
**Impact:** HIGH
**Description:** Route entry는 화면 흐름을 분명하게 보여줘야 하며, helper 추출도 경계가 정당할 때만 해야 합니다.
layout-only 분리는 지양하지만 async, state,
interaction 같은 runtime boundary를 소유한 route-local section은 추출할 수 있습니다.

## 6. Events and Interaction Flow (events)
**Impact:** MEDIUM-HIGH
**Description:** Event handler는 이름이 예측 가능하고 effect 재실행을 유발하지 않는 직접적인 사용자 액션 흐름으로
  유지해야 합니다.

## 7. State and Data Flow (state)
**Impact:** CRITICAL
**Description:** Server state, store 접근, 파생값, effect callback, transition은 오리진을 보존해야 하며 데이터 변형도
  가능한 한 소스 가까이에 있어야 합니다.

## 8. Documentation and Comments (docs)
**Impact:** MEDIUM
**Description:** React 경계 선언에는 companion skill인 `convention-typescript`의 annotation 표준을 적용하고, compound
  component의 public part는 `@part`와 `@description`으로 읽히게 문서화하며, inline comment는 JSX나 handler 흐름에서
  비자명한 제약만 설명해야 합니다.
