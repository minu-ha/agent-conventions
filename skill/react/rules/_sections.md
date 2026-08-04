# 섹션

이 파일은 리액트 컨벤션 rule의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Ownership and Boundaries (ownership)
**TitleKo:** 소유와 경계
**Impact:** CRITICAL
**Description:** ui, widget, owner-private 코드는 소유 경계가 분명해야 에이전트가 코드를 예측 가능하게 배치할 수
  있습니다. 소유자 아래 role 폴더 구조, 하향 단방향 가져오기, 생명주기 소유가 이 경계를 지탱합니다.

## 2. Typing and Contracts (typing)
**TitleKo:** 타입과 계약
**Impact:** HIGH
**Description:** 리액트가 제공하는 핸들러와 prop 계약은 선언 위치에서 바로 드러나야 하며, props와 콜백 시그니처
  재사용도 리액트 문맥에 맞게 유지해야 합니다.

## 3. Composition Strategy (strategy)
**TitleKo:** 조립 전략
**Impact:** HIGH
**Description:** Shared 컴포넌트는 single 컴포넌트, 합성 컴포넌트, 드러난 변형 중 어떤 구조를 쓸지 먼저
  결정해야 하며, 합성 컴포넌트는 상태 없는 조립 구조에서 시작해 필요할 때 같은 공개 이름을 유지한 채 stateful
  구조로 확장될 수 있어야 합니다.

## 4. Component Structure and JSX (composition)
**TitleKo:** 컴포넌트 구조와 JSX
**Impact:** HIGH
**Description:** 컴포넌트는 계약과 변형이 분명하게 드러나야 하며, JSX 안에 동작을 숨기지 않고 리액트 19 기준의
  컴포넌트 구조를 읽기 쉽게 유지해야 합니다.

## 5. Screen File Discipline (screen)
**TitleKo:** 화면 파일 규율
**Impact:** HIGH
**Description:** Route 진입은 화면 흐름을 분명하게 보여줘야 하며, 보조 함수 추출도 경계가 정당할 때만 해야 합니다.
  layout-only 분리는 지양하지만 async, 상태, 상호작용 같은 실행 환경 경계를 소유한 route-local 섹션은 추출할 수
  있습니다.

## 6. Events and Interaction Flow (events)
**TitleKo:** 이벤트와 상호작용 흐름
**Impact:** MEDIUM-HIGH
**Description:** Event 핸들러는 이름이 예측 가능하고 이펙트 재실행을 유발하지 않는 직접적인 사용자 액션 흐름으로
  유지해야 합니다.

## 7. Server Data Flow (data)
**TitleKo:** 서버 데이터 흐름
**Impact:** CRITICAL
**Description:** Query와 변경 요청은 오리진을 보존해야 하며, 응답 변형은 `query.select`처럼 소스에 가장 가까운 지점에서
  끝내야 합니다. binding 이름도 어떤 API에서 왔는지 드러내야 합니다.

## 8. Local State (state)
**TitleKo:** 로컬 상태
**Impact:** HIGH
**Description:** 로컬 상태는 값의 수명과 소유자에 맞는 도구로 고르고, 파생값은 저장하지 않고 렌더에서 계산해야 합니다.
  이펙트 콜백은 반응성이 필요한 값만 의존성으로 받아야 합니다.

## 9. Render Performance (perf)
**TitleKo:** 렌더 성능
**Impact:** MEDIUM-HIGH
**Description:** 메모이제이션은 리액트 컴파일러를 기본으로 두고 직접 손대지 않습니다. 실제로 무거운 초기화와 갱신만 lazy
  초기화 함수, 전환, 지연 value로 미룹니다.

## 10. Documentation and Comments (docs)
**TitleKo:** 문서화와 주석
**Impact:** MEDIUM
**Description:** 리액트 경계 선언에는 동반 스킬인 `convention-typescript`의 doc 주석 표준을 적용하고, 합성
  컴포넌트의 공개 부품은 props `interface` 위 설명으로 문서화하며, inline 주석은 JSX나 핸들러 흐름에서
  비자명한 제약만 설명해야 합니다.
