# Open ref Props Only for Real Imperative Contracts

**Impact: MEDIUM (사용하지 않는 명령형 계약이 공용 컴포넌트에 늘어나는 것을 막습니다)**

`ref`는 사용처가 포커스, 스크롤, 측정 등을 직접 제어해야 할 때만 엽니다.
현재 사용처가 없으면 미리 공개하지 않습니다.

| 조건 | 처리 |
| --- | --- |
| 리액트 19 이상만 지원함 | `forwardRef`로 감싸지 않고 `ref`를 일반 프롭으로 받습니다 |
| 리액트 18 이하도 지원함 | `forwardRef` 계약을 유지합니다. 지원 버전을 바꾸지 않고 일괄 전환하지 않습니다 |
| `useImperativeHandle`로 명령 메서드를 공개함 | 계약 이름을 `<Owner>Handle`로 짓습니다 |
| DOM 요소를 직접 가리킴 | 별도 `Handle` 타입을 만들지 않습니다 |
| 외부 패키지 타입 제약으로 래퍼가 필요함 | `typescript/docs-justify-convention-exceptions-with-a-reason-comment`에 따라 이유를 남깁니다 |

**Incorrect 1 (`ref` 계약이 필요 없는 단순 화면 컴포넌트에도 습관적으로 `ref`를 노출합니다):**

```tsx
import type {Ref} from "react";

export interface UiStatusBadgeProps {
	ref?: Ref<HTMLSpanElement>;
	label: string;
}

export const UiStatusBadge = (props: UiStatusBadgeProps) => {
	return <span ref={props.ref}>{props.label}</span>;
};
```

**Correct 1 (`ref`가 실제로 필요한 공개 API일 때만 리액트 19 방식으로 직접 받습니다):**

```tsx
import type {ChangeEventHandler, Ref} from "react";

/**
 * 검색 입력 계약
 *
 * 결과 목록에서 검색어로 포커스를 되돌려야 해 `ref`를 연다.
 * 보이는 라벨을 둘 자리가 없어 이름은 `aria-label`로만 준다.
 */
export interface UiSearchInputProps {
	/**
	 * 사용처가 포커스를 옮길 때 쓰는 참조
	 */
	ref?: Ref<HTMLInputElement>;
	/**
	 * 스크린 리더가 읽을 이름
	 */
	label: string;
	/**
	 * 입력값
	 */
	value: string;
	/**
	 * 입력이 바뀔 때
	 */
	onChange: ChangeEventHandler<HTMLInputElement>;
}

export const UiSearchInput = (props: UiSearchInputProps) => {
	return (
		<input
			ref={props.ref}
			aria-label={props.label}
			onChange={props.onChange}
			value={props.value}
		/>
	);
};
```

> 나머지 예시 · 예외는 [full rule](../rules/05-04-composition-open-ref-props-only-for-imperative-contracts.md)에 있습니다.
