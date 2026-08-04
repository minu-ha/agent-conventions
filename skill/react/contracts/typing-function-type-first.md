# Take React Handler and Wrapper Prop Types From Existing Contracts

**Impact: HIGH (같은 시그니처를 손으로 다시 적지 않아 계약이 어긋나지 않습니다)**

타입을 어디에 붙일지는 `typescript/types-prefer-function-variable-types-over-parameter-annotations`가
정합니다. 여기서는 그 규칙이 다루지 않는 리액트 두 자리만 봅니다.

**커링 팩토리가 돌려주는 함수에도 타입을 적습니다.**
JSX에 넘기면 리액트가 알아서 타입을 붙여 주지만, 그러면 팩토리 선언만 봐서는 무엇을
돌려주는지 알 수 없습니다. `MouseEventHandler<...>` 같은 리액트 별칭을 반환 타입으로 적습니다.

**`Ui*` 래퍼를 쓸 때는 래퍼가 내보낸 `Ui*Props`를 가져옵니다.**
안에서 쓰는 라이브러리의 원본 프롭스 타입을 가져오지 않습니다.
래퍼가 일부러 좁히거나 늘린 계약이 사용처로 새지 않게 하려는 것입니다.

`query.select` 같은 훅 옵션의 일회성 문맥 콜백은 리액트 핸들러 구현이 아니라 대상이 아닙니다.

**Requires selected:** `typescript/types-prefer-function-variable-types-over-parameter-annotations` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/02-01-typing-function-type-first.md)을 읽습니다.
