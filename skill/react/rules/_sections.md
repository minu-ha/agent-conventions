# 섹션

이 파일은 리액트 컨벤션 규칙의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Ownership and Boundaries (ownership)
**TitleKo:** 소유와 경계
**Impact:** CRITICAL
**Description:** `ui`, `widget`, `page` 세 레이어의 소유 경계가 분명해야 코드를 예측 가능하게 배치할 수 있습니다.
레이어와 역할에 맞춰 이름과 폴더를 정하고, 가져오기는 하위 레이어로만 향합니다.
생명주기는 해당 컴포넌트가 관리하고 순수 계산은 훅으로 감싸지 않습니다.

## 2. Server Data Flow (data)
**TitleKo:** 서버 데이터 흐름
**Impact:** HIGH
**Description:** 쿼리와 뮤테이션의 바인딩 이름에 API 출처를 드러냅니다.
응답 가공은 `query.select`처럼 출처에 가까운 곳에서 처리하고, 실패 처리와 무효화는 호출한 곳에서 맡습니다.

## 3. Typing and Contracts (typing)
**TitleKo:** 타입과 계약
**Impact:** CRITICAL
**Description:** 리액트 핸들러 타입과 래퍼가 제공하는 프롭 계약을 선언에 명시합니다.
라이브러리 래퍼는 허용할 프롭 범위를 좁히고 구조에 맞는 방법으로 전달합니다.
일반 TypeScript 타입 규칙은 동반 스킬이 다루고 여기서는 리액트 문맥만 봅니다.

## 4. Composition Strategy (strategy)
**TitleKo:** 조립 전략
**Impact:** MEDIUM
**Description:** 공용 컴포넌트는 단일 · 합성 · 명시적 변형 중 구조를 먼저 고르고 공개할 부품을 정합니다.
불리언 프롭으로 모드를 늘리지 않고, 정적 조립에는 렌더 프롭 대신 `children`을 씁니다.

## 5. Component Structure and JSX (composition)
**TitleKo:** 컴포넌트 구조와 JSX
**Impact:** HIGH
**Description:** 프롭스 계약은 컴포넌트 바로 위에 선언하고 값은 `props.`로 읽어 출처를 남깁니다.
본문은 훅, 핸들러, 이펙트, 반환 순으로 읽힙니다.
JSX 안에는 동작을 숨기지 않고, 컴포넌트를 컴포넌트 안에서 정의하지 않습니다.
`ref`는 실제 명령형 계약이 있을 때만 열고, `Activity`는 숨긴 상태와 DOM을 보존해야 할 때만 씁니다.
조각과 조건부 렌더링은 형태를 하나로 고정합니다.

## 6. Screen File Discipline (screen)
**TitleKo:** 화면 파일 규율
**Impact:** MEDIUM
**Description:** 라우트 진입 파일에 화면 흐름을 드러내고, 상태나 비동기를 직접 소유한 섹션만 추출합니다.
파생값은 사용처에서 계산하고 필요가 확인되기 전에 분리하지 않습니다.

## 7. Runtime Boundaries (runtime)
**TitleKo:** 런타임 경계
**Impact:** HIGH
**Description:** 화면 표시를 막는 로딩과 오류는 경계에서 처리합니다.
`Suspense`와 오류 경계의 위치를 정하고, 경계가 처리할 분기는 화면 본문에 남기지 않습니다.

## 8. State Ownership and Updates (state)
**TitleKo:** 상태 소유와 갱신
**Impact:** HIGH
**Description:** 상태는 값의 수명과 소유자에 맞는 도구로 고르고, 파생값은 저장하지 않고 렌더에서 계산해야 합니다.
여러 화면이 공유하는 판단만 전역 스토어에 두고, 이전 상태에 의존하는 갱신은 함수형으로 씁니다.
이펙트의 반응형 값은 의존성에 남기고, 최신 값을 읽기만 하는 콜백은 `useEffectEvent`로 분리합니다.
URL 상태의 바인딩 이름을 통일해 서버 응답과 구분합니다.

## 9. Events and Interaction Flow (events)
**TitleKo:** 이벤트와 상호작용 흐름
**Impact:** HIGH
**Description:** 이벤트 핸들러는 정해진 이름을 쓰고 추가 인자는 커링으로 전달합니다.
사용자 동작에 따른 처리는 이펙트가 아닌 핸들러에서 실행합니다.

## 10. Render Performance (perf)
**TitleKo:** 렌더 성능
**Impact:** MEDIUM
**Description:** 메모이제이션은 필요를 확인한 경우에만 적용합니다.
실제로 무거운 초기화와 갱신만 초기화 함수, 트랜지션, 지연 값으로 미룹니다.

## 11. Accessibility (a11y)
**TitleKo:** 접근성
**Impact:** HIGH
**Description:** 조작할 수 있는 요소에는 스크린 리더와 테스트가 찾을 수 있는 이름을 제공합니다.
보이는 글자를 이름으로 사용하고, 글자가 없으면 대체 이름을 지정합니다.

## 12. Documentation and Comments (docs)
**TitleKo:** 문서화와 주석
**Impact:** MEDIUM
**Description:** 문서 주석의 형식과 태그, 그리고 어느 선언에 붙일지는 동반 스킬인
`convention-typescript`가 정합니다. 이 섹션에서는 리액트 전용 선언의 문서화와 JSX 자식 위치의 주석 형식을 정합니다.

## 13. Tooling (tooling)
**TitleKo:** 도구 설정
**Impact:** MEDIUM
**Description:** 리액트 전용 검사는 `biome` 도메인 설정으로 지정하고, 도구가 판단하지 못하는 항목은 리뷰에서 확인합니다.
