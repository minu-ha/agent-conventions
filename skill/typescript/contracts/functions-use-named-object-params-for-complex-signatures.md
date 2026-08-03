# Use Named Object Params for Complex Signatures

**Impact: HIGH (긴 시그니처를 읽을 수 있게 두고 위치를 헷갈리지 않으면서 입력을 늘립니다)**

매개변수가 3개를 넘거나 같은 계열 값이 함께 넘어오면 객체 하나로 묶습니다.
시그니처 자리에서 바로 구조분해하지 않습니다.
객체 매개변수 타입은 파일 위쪽에 이름을 붙여 선언하고, 함수 본문 첫 줄에서 구조분해합니다.
구조분해 줄이 길어 포매터 예외가 필요해도 함수 본문 안에서 처리합니다.

React 함수 컴포넌트가 props 를 통째로 받아 본문에서 구조분해하는 것만 바뀌면
`react/composition-destructure-props-inside`가 담당하므로 이 규칙을 겹쳐 적용하지 않습니다.
객체 인자와 필드 타입, 선택 여부, 뜻이 같은 계약이 이미 있으면 그대로 씁니다.
이 규칙을 지키려고 `*Params`나 `*Args`를 새로 만들지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/03-05-functions-use-named-object-params-for-complex-signatures.md)을 읽습니다.
