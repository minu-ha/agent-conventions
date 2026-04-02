# 섹션

이 파일은 React 컨벤션 rule의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Ownership and Boundaries (ownership)
**Impact:** CRITICAL
**Description:** Shared UI, widget, route-local 코드는 소유 경계가 분명해야 에이전트가 코드를 예측 가능하게 배치할 수 있습니다.

## 2. Typing and Contracts (typing)
**Impact:** HIGH
**Description:** 명시적인 함수, prop, API 계약은 모호함을 줄이고 React 코드를 추적 가능하게 유지합니다.

## 3. Component Structure and JSX (composition)
**Impact:** HIGH
**Description:** 컴포넌트는 계약이 분명하게 드러나야 하며, JSX 안에 동작을 숨기지 않고 렌더링 로직을 읽기 쉽게 유지해야 합니다.

## 4. Screen File Discipline (screen)
**Impact:** HIGH
**Description:** Route entry 파일은 화면 흐름을 분명하게 보여줘야 하며, helper 추출도 경계가 정당할 때만 해야 합니다.

## 5. Events and Interaction Flow (events)
**Impact:** MEDIUM-HIGH
**Description:** Event handler는 이름이 예측 가능하고 간접 호출이 최소화된 상태로, 빠르게 훑어볼 수 있어야 합니다.

## 6. State and Data Flow (state)
**Impact:** CRITICAL
**Description:** Server state, store 접근, 파생값은 오리진을 보존해야 하며 데이터 변형도 가능한 한 소스 가까이에 있어야 합니다.

## 7. Documentation and Comments (docs)
**Impact:** MEDIUM
**Description:** 주석은 코드를 반복하지 말고, 의도와 제약, 부수효과를 간결한 한글로 설명해야 합니다.
