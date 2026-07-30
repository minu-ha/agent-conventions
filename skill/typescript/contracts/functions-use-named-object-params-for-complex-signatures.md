# Use Named Object Params for Complex Signatures

**Impact: HIGH (긴 함수 시그니처를 읽을 수 있게 유지하고 위치 혼동 없이 묶인 입력을 확장하게 함)**

매개변수가 3개 이상이거나 같은 계열 값이 묶여 전달되면 단일 객체 매개변수로 묶고,
함수 시그니처에서 바로 구조분해하지 않습니다.
객체 매개변수 타입은 파일 최상단의 named contract를 사용하고, 함수 본문 첫 줄에서 구조분해해 사용합니다.
구조분해 줄이 길어 formatter 예외가 꼭 필요할 때도 함수 본문 안에서 처리합니다.

React 함수 컴포넌트의 props 전체 수신과 본문 구조분해만 바뀌는 경우는 `react/composition-destructure-props-inside`가
담당하므로 이 규칙을 중복 선택하지 않습니다.
객체 인자와 field type·optionality·의미가 같은 기존 named contract가 있으면 그대로 재사용하고,
이 규칙을 지키기 위해 별도 `*Params`나 `*Args`를 새로 만들지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/03-05-functions-use-named-object-params-for-complex-signatures.md)을 읽습니다.
