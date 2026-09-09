# Take React Handler and Wrapper Prop Types From Existing Contracts

**Impact: MEDIUM (같은 시그니처를 직접 다시 적어 생기는 계약 불일치를 막습니다)**

리액트 핸들러와 래퍼 프롭스의 타입은 기존 계약에서 가져옵니다.
타입을 붙이는 기본 위치는 `typescript/types-prefer-function-variable-types-over-parameter-annotations`를 따릅니다.

| 자리 | 타입 출처 |
| --- | --- |
| 커링 팩토리가 반환하는 핸들러 | `MouseEventHandler<...>` 같은 리액트 별칭을 팩토리 반환 타입에 적습니다 |
| `Ui*` 래퍼 사용처 | 내부 라이브러리의 원본 타입 대신 래퍼가 내보낸 `Ui*Props`를 가져옵니다 |

JSX에 직접 쓴 화살표 함수와 달리, 팩토리가 반환하는 함수에는 리액트의 문맥 타입이 붙지 않습니다.
반환 타입을 생략하면 안쪽 매개변수가 암시적 `any`가 되어 `strict`에서 컴파일 오류가 납니다.
래퍼 타입을 사용하면 래퍼가 좁히거나 추가한 계약도 사용처에 반영됩니다.

`query.select` 같은 훅 옵션의 일회성 문맥 콜백은 리액트 핸들러 구현이 아니므로 대상에서 제외합니다.

**Requires selected:** `typescript/types-prefer-function-variable-types-over-parameter-annotations` (함께 적용)

**Incorrect 1 (팩토리 반환 타입을 적지 않아 이벤트가 암시적 `any`가 됩니다):**

```ts
const handleRowSelectToggle = (rowId: string) => (event) => {
	event.preventDefault();
	toggleSelection(rowId);
};
```

**Correct 1 (팩토리 반환 타입을 기존 별칭으로 고정합니다):**

```ts
import type {MouseEventHandler} from "react";

/**
 * 행 id를 커링으로 고정해 목록 JSX에 인라인 래퍼를 두지 않게 한다
 */
const handleRowSelectToggle =
	(rowId: string): MouseEventHandler<HTMLButtonElement> =>
	(event) => {
		event.preventDefault();
		toggleSelection(rowId);
	};
```

> 나머지 예시와 예외는 [full rule](../rules/03-01-typing-take-handler-types-from-existing-contracts.md)에 있습니다.
