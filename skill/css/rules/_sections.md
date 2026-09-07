# 섹션

이 파일은 CSS 컨벤션 규칙의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Class Naming and Syntax (naming)
**TitleKo:** 클래스 이름과 문법
**Impact:** MEDIUM
**Description:** 일반 `*.css`를 사용하고 전역에서 고유한 클래스명을 붙입니다.
클래스 이름은 소유자와 역할을 드러내고, 요소와 수정자는 정해진 문법으로 구분합니다.

## 2. Ownership and Boundaries (ownership)
**TitleKo:** 소유와 경계
**Impact:** CRITICAL
**Description:** CSS 파일마다 소유자를 정하고, 다른 소유자의 스타일을 사용할 때 지킬 범위를 명시합니다.
외부 라이브러리 DOM은 소유한 루트 아래에서만 선택해 다른 화면에 영향을 주지 않습니다.

## 3. Class Composition in TSX (composition)
**TitleKo:** TSX 클래스 조합
**Impact:** HIGH
**Description:** TSX에서 클래스를 조합하는 방법과 UI 래퍼가 허용하는 스타일 범위를 정합니다.
클래스의 책임과 수정자로 표현할 변형을 구분하고, 시각적 표현은 인라인 `style` 대신 클래스로 지정합니다.

## 4. Selectors and Declaration Placement (selector)
**TitleKo:** 선택자와 선언 배치
**Impact:** HIGH
**Description:** 선택 대상은 클래스명으로 명시하고, 각 클래스의 선언은 한 블록에 모읍니다.
브라우저가 제공하는 DOM 상태는 가상 클래스로, 앱이 정의한 상태는 수정자 클래스로 표현합니다.

## 5. Design Tokens (values)
**TitleKo:** 디자인 토큰
**Impact:** HIGH
**Description:** 여러 파일이 공유하는 값은 전역 토큰으로 정의하고 사용처에서는 토큰 이름을 참조합니다.
`z-index` 순서와 테마 값도 토큰으로 관리해 변경할 곳을 한곳에 모읍니다.

## 6. Layout and Responsiveness (layout)
**TitleKo:** 레이아웃과 반응형
**Impact:** MEDIUM
**Description:** 클래스명과 선언에 배치 의도를 드러내고, 폭에 따른 변경은 한곳에 모읍니다.
브레이크포인트를 추가하기 전에 고유 크기 지정으로 해결할 수 있는지 확인합니다.
뷰포트 브레이크포인트는 파일 아래 한 곳에 모으고 데스크톱 퍼스트로 정한 세 값만 씁니다.
컴포넌트가 받은 폭에 따라 구조를 바꿔야 하면 컨테이너 쿼리를 씁니다.

## 7. Accessibility and Motion (a11y)
**TitleKo:** 접근성과 움직임
**Impact:** CRITICAL
**Description:** 키보드 포커스를 눈으로 확인할 수 있고, 움직임에 민감한 사용자도 이용할 수 있어야 합니다.
포커스 표시는 없애지 않고 형태로 구분하며, 애니메이션은 전역 이름을 겹치지 않게 두고 사용자 설정을 따릅니다.

## 8. Tooling (tooling)
**TitleKo:** 도구 설정
**Impact:** MEDIUM
**Description:** 자동 검사할 항목은 stylelint로 설정하고, 도구가 판단하지 못하는 항목은 리뷰에서 확인합니다.
