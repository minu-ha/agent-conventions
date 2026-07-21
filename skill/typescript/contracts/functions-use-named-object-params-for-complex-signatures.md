# Use Named Object Params for Complex Signatures

**Impact: HIGH (keeps long function signatures readable and makes grouped inputs easier to extend without positional confusion)**

매개변수가 3개 이상이거나 같은 계열 값이 묶여 전달되면 단일 객체 매개변수로 묶고, 함수 시그니처에서 바로 구조분해하지 않습니다. 객체 매개변수 타입은 파일 최상단에 선언하고, 함수 본문 첫 줄에서 구조분해해 사용합니다. 구조분해 줄이 길어 formatter 예외가 꼭 필요할 때도 함수 본문 안에서 처리합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/functions-use-named-object-params-for-complex-signatures.md)을 추가로 읽고 fallback 사유를 기록합니다.
