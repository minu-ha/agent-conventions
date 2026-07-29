# Prefer Arrow Functions and Object Parameters for Complex Signatures

**Impact: MEDIUM-HIGH (함수 선언과 다중 인자 계약을 더 쉽게 확장하고 수정할 수 있게 함)**

함수는 기본적으로 화살표 함수로 선언하고,
매개변수가 3개 이상이거나 같은 계열 값이 함께 이동하면
단일 객체 매개변수로 묶습니다.
객체 매개변수 타입은 파일 상단에 선언해 계약을 먼저 드러냅니다.

> 예시·예외가 필요할 때만 [full rule](../rules/composition-prefer-arrow-functions-and-object-params.md)을 추가로 읽고 fallback 사유를 기록합니다.
