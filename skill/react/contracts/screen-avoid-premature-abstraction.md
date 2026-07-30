# Avoid Premature Abstraction in Screen Code

**Impact: HIGH (추측성 추출 대신 실제 재사용 경계에 맞춰 route 코드를 유지합니다)**

반복이 보인다는 이유만으로 공용 hook, component, helper를 만들지 않습니다.

추출 전에 먼저 시도할 방법:

- 한 함수 안에서 단계 변수, section comment, 내부 블록으로 정리
- route-local JSX에 남기고 흐름을 보이게 유지
- 작은 mapper, href 조립, fallback 처리는 호출 위치에 유지

추출을 허용하는 경우:

- 여러 화면/모듈이 같은 이름의 계약으로 직접 호출하는 경우
- state·effect·context·form·store 연결을 한 custom hook이 실제로 소유하는 경우
- route-local component가 async/state/provider/interaction 같은 runtime boundary를 소유하는 경우

금지하는 구조:

- 한 component, 한 handler, 한 query `select`만 쓰는 helper를 support module에 쌓는 구조
- export helper가 다른 export helper 하나만 위해 존재하는 구조
- 이름이 그럴듯하다는 이유로 흐름을 파일 왕복 뒤에 숨기는 구조

> 예시·예외가 필요하면 [full rule](../rules/screen-avoid-premature-abstraction.md)을 읽습니다.
