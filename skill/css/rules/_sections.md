# 섹션

이 파일은 CSS 컨벤션 rule의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Class Naming and Syntax (naming)
**TitleKo:** 클래스 이름과 문법
**Impact:** CRITICAL
**Description:** 클래스 문법이 고정되어 있고 요소·수정자 이름이 역할을 가리켜야 스타일을 이름으로 검색할 수 있고,
  이름만 보고 무엇을 담당하는 클래스인지 알 수 있습니다.

## 2. Ownership and Boundaries (ownership)
**TitleKo:** 소유와 경계
**Impact:** CRITICAL
**Description:** 한 CSS 파일이 어떤 소유자의 클래스만 담는지, 다른 소유자의 표현이 필요할 때 무엇을 하는지, 남의 라이브러리
  DOM은 어디까지 겨냥하는지가 정해져야 한 파일을 고쳐서 다른 화면이 깨지는 일이 생기지 않습니다.

## 3. Class Composition in TSX (composition)
**TitleKo:** TSX 클래스 조합
**Impact:** HIGH
**Description:** TSX 클래스 조합과 래퍼 소유 규칙은 스타일링 경계를 분명하게 유지하고, UI 래퍼가 통제되지 않은
  스타일 hook을 노출하는 것을 막습니다.

## 4. Selectors and Declaration Placement (selector)
**TitleKo:** 선택자와 선언 배치
**Impact:** HIGH
**Description:** 겨냥 대상이 코드에 그대로 쓰여 있고 한 클래스의 선언이 한 block에 모여 있어야, 스타일을 고칠 때 읽을
  선택자와 볼 block이 각각 하나로 정해집니다.

## 5. Values, Layout, and Accessibility (values)
**TitleKo:** 값, 레이아웃, 접근성
**Impact:** HIGH
**Description:** 토큰, 변수 fallback, 명시적인 레이아웃 의도, 상태 경계, 눈에 보이는 포커스 표시는 스타일을 더 견고하고
  접근 가능하게 유지합니다.

## 6. Tooling (tooling)
**TitleKo:** 도구 설정
**Impact:** MEDIUM
**Description:** 이 컨벤션 중 기계가 잡을 수 있는 항목은 stylelint 설정으로 고정하고, 잡을 수 없는 항목은
  리뷰가 담당한다는 것을 명시해야 사람이 검사할 목록이 좁아집니다.
