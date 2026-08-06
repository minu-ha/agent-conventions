# Use Named Object Params for Complex Signatures

**Impact: MEDIUM-HIGH (긴 시그니처를 읽을 수 있게 두고 위치를 헷갈리지 않으면서 입력을 늘립니다)**

매개변수가 셋을 넘거나 같은 계열 값이 함께 넘어오면 위치 인자를 객체 하나로 묶습니다.
객체 매개변수 타입은 파일 위쪽에 이름을 붙여 선언합니다.

받은 객체는 시그니처에서도 본문에서도 구조분해하지 않고 `target.baseUrl`처럼 체인으로 읽습니다.
그 규범은 `values-read-objects-through-chains` 규칙이 모든 객체에 정합니다.
여기서는 매개변수를 언제 객체로 묶고 그 타입을 어디에 선언할지만 봅니다.

리액트 컴포넌트의 프롭스는 이 규칙 대상이 아닙니다.
프롭스를 읽는 방식과 타입 선언 위치는 프레임워크 컨벤션이 담당합니다.

뜻이 같은 계약이 이미 있으면 그대로 씁니다.
그 판정은 `types-reuse-existing-contracts-before-new-types`가 합니다.
이 규칙을 지키려고 `*Params`나 `*Args`를 새로 만들지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/03-02-functions-use-named-object-params-for-complex-signatures.md)을 읽습니다.
