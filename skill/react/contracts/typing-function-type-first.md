# Pin React Handler and Wrapper Prop Types at the Declaration

**Impact: HIGH (핸들러 시그니처와 래퍼가 좁힌 계약이 선언 자리에서 바로 드러납니다)**

매개변수마다 타입을 붙이지 않고 함수 변수 타입을 쓰는 일반 규칙은
`typescript/types-prefer-function-variable-types-over-parameter-annotations`가 정합니다.
여기서는 그 규칙이 다루지 않는 리액트 두 자리만 봅니다.

**커링 팩토리의 반환 함수도 리액트 핸들러입니다.**
JSX가 나중에 문맥 타입을 준다는 이유로 반환 타입을 생략하지 않고,
`MouseEventHandler<...>` 같은 기존 별칭으로 팩토리 반환 타입을 고정합니다.

**`Ui*` 래퍼를 쓸 때는 라이브러리 원본 프롭스를 참조하지 않습니다.**
래퍼가 노출한 `Ui*Props`를 참조합니다.
래퍼가 의도적으로 좁히거나 보강한 계약이 사용처로 새지 않게 하려는 것입니다.

`query.select` 같은 훅 옵션의 일회성 문맥 콜백은 리액트 핸들러 구현이 아니라 대상이 아닙니다.

**Requires selected:** `typescript/types-prefer-function-variable-types-over-parameter-annotations` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/02-01-typing-function-type-first.md)을 읽습니다.
