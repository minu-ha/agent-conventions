# Avoid Premature Abstraction in Screen Code

**Impact: HIGH (짐작으로 빼내지 않고 실제 재사용 경계에 맞춰 화면 코드를 둡니다)**

반복이 보인다는 이유만으로 공용 훅, 컴포넌트, 보조 함수를 만들지 않습니다.

추출 전에 먼저 시도할 방법:

- 한 함수 안에서 단계 변수, 섹션 주석, 내부 블록으로 정리
- 화면 지역 JSX에 남기고 흐름을 보이게 유지
- 작은 변환 함수, `href` 조립, 기본값 처리는 호출 위치에 유지

추출해도 되는 경계는 이 규칙이 정하지 않습니다.
컴포넌트는 `screen-extract-local-section-components-for-runtime-boundaries`가,
함수는 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`가 판정합니다.

먼저 시도한 뒤에도 남는 금지 구조:

- 한 컴포넌트, 한 핸들러, 한 쿼리 `select`만 쓰는 보조 함수를 보조 모듈에 쌓는 구조
- 내보내기 보조 함수가 다른 내보내기 보조 함수 하나만 위해 존재하는 구조
- 이름이 그럴듯하다는 이유로 흐름을 파일 왕복 뒤에 숨기는 구조

> 예시·예외가 필요하면 [full rule](../rules/06-02-screen-avoid-premature-abstraction.md)을 읽습니다.
