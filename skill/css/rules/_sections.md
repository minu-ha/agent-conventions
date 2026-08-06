# 섹션

이 파일은 CSS 컨벤션 규칙의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Class Naming and Syntax (naming)
**TitleKo:** 클래스 이름과 문법
**Impact:** MEDIUM-HIGH
**Description:** 이 스킬은 일반 `*.css`와 전역에서 고유한 클래스명을 전제로 하고, 그 전제를 여기서 정합니다.
  클래스 문법이 고정되어 있고 요소와 수정자 이름이 역할을 가리켜야 스타일을 이름으로 검색할 수 있습니다.
  이름만 보고 무엇을 담당하는 클래스인지, 어느 화면 것인지 알 수 있습니다.

## 2. Ownership and Boundaries (ownership)
**TitleKo:** 소유와 경계
**Impact:** CRITICAL
**Description:** 한 CSS 파일이 어떤 소유자의 클래스만 담는지, 다른 소유자의 표현이 필요할 때 무엇을 하는지, 남의 라이브러리
  DOM은 어디까지 겨냥하는지가 정해져야 한 파일을 고쳐서 다른 화면이 깨지는 일이 생기지 않습니다.

## 3. Class Composition in TSX (composition)
**TitleKo:** TSX 클래스 조합
**Impact:** HIGH
**Description:** TSX 클래스 조합과 래퍼 소유 규칙은 스타일링 경계를 분명하게 유지하고, UI 래퍼가 통제되지 않은
  스타일 연결 지점을 노출하는 것을 막습니다.
  한 클래스가 무엇까지 담당하는지, 수정자로 표현할 자격이 있는 모양은 무엇인지도 여기서 정합니다.
  시각 결정을 인라인 `style`이 아니라 클래스로 넘기는 판정도 이 섹션입니다.

## 4. Selectors and Declaration Placement (selector)
**TitleKo:** 선택자와 선언 배치
**Impact:** HIGH
**Description:** 겨냥 대상이 코드에 그대로 쓰여 있고 한 클래스의 선언이 한 블록에 모여 있어야, 스타일을 고칠 때 읽을
  선택자와 볼 블록이 각각 하나로 정해집니다.
  브라우저가 주는 DOM 상태는 가상 클래스로, 앱이 정하는 상태는 수정자로 갈라 그 요소 블록 안에 둡니다.

## 5. Design Tokens (values)
**TitleKo:** 디자인 토큰
**Impact:** HIGH
**Description:** 여러 파일이 함께 쓰는 값은 전역 토큰 한 곳에서 정하고, 쓰는 자리에서는 그 이름만 가리킵니다.
  대체값, 쌓임 층, 테마 전환이 모두 토큰 값을 바꾸는 일로 끝나야 색이나 층을 하나 더할 때 파일 여러 개를 열지 않습니다.

## 6. Layout and Responsiveness (layout)
**TitleKo:** 레이아웃과 반응형
**Impact:** MEDIUM-HIGH
**Description:** 배치 의도가 클래스명과 선언에서 바로 읽혀야 하고, 폭이 달라질 때 무엇이 바뀌는지가 한 자리에 모여야 합니다.
  분기점을 적기 전에 스스로 접히는 크기 지정으로 되는지 먼저 보고, 남는 분기점은 파일 아래 한 곳에 데스크톱 퍼스트로 둡니다.

## 7. Accessibility and Motion (a11y)
**TitleKo:** 접근성과 움직임
**Impact:** CRITICAL
**Description:** 키보드 사용자가 지금 어디에 있는지 보이고, 움직임에 민감한 사용자가 막히지 않아야 합니다.
  포커스 표시는 없애지 않고 형태로 구분하며, 애니메이션은 전역 이름을 겹치지 않게 두고 사용자 설정을 따릅니다.

## 8. Tooling (tooling)
**TitleKo:** 도구 설정
**Impact:** MEDIUM
**Description:** 이 컨벤션 중 기계가 잡을 수 있는 항목은 stylelint 설정으로 고정하고, 잡을 수 없는 항목은
  리뷰가 담당한다는 것을 명시해야 사람이 검사할 목록이 좁아집니다.
