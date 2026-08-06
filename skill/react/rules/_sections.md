# 섹션

이 파일은 리액트 컨벤션 규칙의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Ownership and Boundaries (ownership)
**TitleKo:** 소유와 경계
**Impact:** CRITICAL
**Description:** `ui`, `widget`, `page` 세 레이어의 소유 경계가 분명해야 코드를 예측 가능하게 배치할 수 있습니다.
  레이어 판정과 이름 표기, 역할 폴더, 하향 단방향 가져오기, 생명주기 소유가 이 경계를 지탱하고, 순수
  계산을 훅으로 감싸지 않는 규율도 여기에 속합니다.

## 2. Server Data Flow (data)
**TitleKo:** 서버 데이터 흐름
**Impact:** HIGH
**Description:** 쿼리와 뮤테이션은 출처를 보존해야 하며, 응답 변형은 `query.select`처럼 소스에 가장 가까운 지점에서
  끝내야 합니다.
  바인딩 이름도 어떤 API에서 왔는지 드러내야 하고, 실패와 무효화는 부른 자리에서 받습니다.

## 3. Typing and Contracts (typing)
**TitleKo:** 타입과 계약
**Impact:** CRITICAL
**Description:** 리액트 핸들러 타입과 래퍼가 노출한 프롭 계약은 선언 자리에서 바로 드러나야 합니다.
  라이브러리 래퍼는 여는 표면을 좁히고 형태에 맞는 방법으로 프롭을 넘깁니다.
  일반 TypeScript 타입 규칙은 동반 스킬이 다루고 여기서는 리액트 문맥만 봅니다.

## 4. Composition Strategy (strategy)
**TitleKo:** 조립 전략
**Impact:** MEDIUM-HIGH
**Description:** 공용 컴포넌트는 단일 컴포넌트, 합성 컴포넌트, 드러난 변형 중 어떤 구조를 쓸지 먼저
  결정하고, 그다음 무엇을 공개 부품으로 열지 정합니다.
  불리언 프롭으로 모드를 늘리지 않고, 정적 조립에는 렌더 프롭 대신 `children`을 씁니다.

## 5. Component Structure and JSX (composition)
**TitleKo:** 컴포넌트 구조와 JSX
**Impact:** HIGH
**Description:** 프롭스 계약은 컴포넌트 바로 위에서 읽히고 값은 `props.`로 읽어 출처를 남깁니다.
  JSX 안에는 동작을 숨기지 않고, 컴포넌트를 컴포넌트 안에서 정의하지 않습니다.
  `ref`와 `Activity`처럼 밖으로 여는 창구는 실제 계약이 있을 때만 엽니다.
  조각과 조건부 렌더링은 형태를 하나로 고정합니다.

## 6. Screen File Discipline (screen)
**TitleKo:** 화면 파일 규율
**Impact:** MEDIUM-HIGH
**Description:** 라우트 진입은 화면 흐름을 분명하게 보여 줘야 하고, 떼어 내는 것은 자기 상태나 비동기를 직접 가진 섹션뿐입니다.
  파생값은 쓰는 자리에서 계산하고, 짐작으로 미리 빼내지 않습니다.

## 7. Runtime Boundaries (runtime)
**TitleKo:** 런타임 경계
**Impact:** HIGH
**Description:** 막는 로딩과 실패는 화면 본문이 아니라 경계가 받습니다.
  `Suspense` 경계와 오류 경계를 어느 층에 두는지, 본문에 남기지 않을 분기가 무엇인지를 여기서 정합니다.

## 8. State Ownership and Updates (state)
**TitleKo:** 상태 소유와 갱신
**Impact:** HIGH
**Description:** 상태는 값의 수명과 소유자에 맞는 도구로 고르고, 파생값은 저장하지 않고 렌더에서 계산해야 합니다.
  여러 화면이 함께 쓰는 판단만 전역 스토어로 올리고, 이전 상태에 기대는 갱신은 함수형으로 씁니다.
  이펙트 콜백은 반응성이 필요한 값만 의존성으로 받아야 합니다.

## 9. Events and Interaction Flow (events)
**TitleKo:** 이벤트와 상호작용 흐름
**Impact:** HIGH
**Description:** 이벤트 핸들러는 이름이 예측 가능하고 추가 인자를 커링으로 넘겨야 하며, 사용자 액션은 이펙트가
  아니라 핸들러에서 실행해야 합니다.
  핸들러 흐름은 재사용 근거가 생길 때까지 그 자리에 둡니다.

## 10. Render Performance (perf)
**TitleKo:** 렌더 성능
**Impact:** MEDIUM
**Description:** 메모이제이션은 확인한 이유가 있을 때만 손댑니다.
  실제로 무거운 초기화와 갱신만 게으른 초기화 함수, 전환, 지연 값으로 미룹니다.

## 11. Accessibility (a11y)
**TitleKo:** 접근성
**Impact:** HIGH
**Description:** 누르고 입력하는 요소는 스크린 리더와 테스트가 이름으로 찾을 수 있어야 합니다.
  보이는 글자가 곧 그 이름이고, 글자가 없으면 대체 이름을 따로 답니다.

## 12. Documentation and Comments (docs)
**TitleKo:** 문서화와 주석
**Impact:** MEDIUM
**Description:** 문서 주석의 형식과 태그, 그리고 어느 선언에 붙일지의 기본 목록은 동반 스킬인
  `convention-typescript`가 정합니다.
  여기서는 그 목록에 리액트만 아는 대상을 더합니다.
