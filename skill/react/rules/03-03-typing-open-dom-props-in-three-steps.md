---
title: Open DOM Props in Three Steps
titleKo: 래퍼의 DOM 표면은 세 단계로 엽니다
impact: HIGH
impactDescription: 프롭 하나가 부딪혔다고 `id`·`role`·`aria-*`·이벤트까지 잃지 않습니다
appliesWhen:
  - 래퍼 프롭스가 `HTMLAttributes`를 `extends` 하거나 그 상속을 뗄 때
  - 라이브러리 프롭과 DOM 프롭의 이름이 부딪혀 컴파일이 막힐 때
  - 제외: DOM 프롭이 아닌 표시 프롭만 더하거나 빼는 경우
reviewWith: >-
  typing-narrow-library-wrapper-contracts, css/composition-do-not-style-through-the-style-attribute,
  typescript/types-reuse-existing-contracts-before-new-types
tags: typing, wrapper, dom
---

## Open DOM Props in Three Steps

**Impact: HIGH (프롭 하나가 부딪혔다고 `id`·`role`·`aria-*`·이벤트까지 잃지 않습니다)**

무엇을 열지는 `typing-narrow-library-wrapper-contracts`가 먼저 정합니다.
이 규칙은 그중 DOM 표면을 어떤 형태로 열지만 봅니다.

**DOM 표면을 여는 방법은 세 단계이고 위에서부터 되는 것을 씁니다.**
어느 단계인지는 컴파일러가 알려 주므로 미리 고민하지 않습니다.

| 단계 | 언제 | 형태 |
| --- | --- | --- |
| 1 | 그냥 컴파일됨 | `extends <요소>HTMLAttributes<T>` |
| 2 | 라이브러리가 같은 이름 프롭의 **값을 좁혀** 부딪힘 | `extends Omit<<요소>HTMLAttributes<T>, "color">`로 빼고 그 프롭을 인덱스 접근으로 다시 엽니다 |
| 3 | 감싸는 요소와 이벤트 대상 요소가 **서로 다름** | `extends`를 쓰지 않고 필요한 프롭만 선언합니다 |

여는 타입은 그 요소 전용 인터페이스입니다.
버튼은 `ButtonHTMLAttributes`, 입력은 `InputHTMLAttributes`, 셀은 `TdHTMLAttributes`입니다.
`HTMLAttributes`만 쓰면 `disabled`·`type`·`colSpan`처럼 그 요소에만 있는 속성을 잃습니다.
요소 전용 인터페이스가 없는 `tr` 같은 자리만 `HTMLAttributes`를 그대로 씁니다.

1·2단계 `extends`는 `{...props}`로 통째로 넘기는 래퍼의 형태입니다.
자기 프롭이 있어 이름으로 하나씩 넘기는 래퍼는 3단계처럼 넘길 DOM 프롭만 선언합니다.
그 판정은 `typing-choose-wrapper-shape-and-forwarding`이 정합니다.

2단계가 필요한 이유는 `HTMLAttributes`에 `color`, `title`, `onChange`, `defaultValue`가 이미 있어서입니다.
라이브러리가 그중 하나를 자기 값 집합으로 좁혀 두면 `extends`가 막힙니다.
그때는 **부딪히는 이름만 빼면 되지, 나머지 DOM 표면을 포기하지 않습니다.**

3단계는 입력 래퍼에서 나옵니다.
겉을 `div`로 감싸면서 이벤트는 안쪽 `input`이 받는 컴포넌트가 그렇습니다.
값이 아니라 요소 타입이 어긋나므로 `Omit`으로 한둘 빼도 이벤트 핸들러가 줄줄이 걸립니다.
이때는 DOM 프롭도 필요한 것만 적고, 라이브러리 타입이 아니라 `string`,
`ChangeEventHandler<HTMLInputElement>` 같은 플랫폼 타입을 씁니다.
`value`나 `onChange`처럼 DOM이 이미 정한 이름은 라이브러리 것이 아닙니다.


여기 쓰는 `Omit`은 `typescript/types-reuse-existing-contracts-before-new-types`가 허용하는 자리입니다.
DOM 표면은 리액트가 속성을 더하면 래퍼도 따라 받아야 하는 열린 집합이라
뺄 이름만 적는 것이 맞습니다.
남는 것을 손으로 적을 수도 없습니다.

- `aria-*`와 `data-*`는 하이픈이 들어 있어 TypeScript가 검사하지 않습니다.
  선언하지 않아도 넘어갑니다.
- `HTMLAttributes`를 `extends` 하면 `style`도 같이 열립니다.
  인라인 `style`을 쓸지는 `css/composition-do-not-style-through-the-style-attribute`가 정합니다.

**Incorrect (프롭 하나가 부딪힌다고 DOM 표면을 통째로 포기합니다):**

```tsx
// id·role·tabIndex·aria-*·이벤트를 전부 잃고 다섯 개만 남았다
export interface UiButtonProps {
	className?: string;
	children?: ReactNode;
	color?: ButtonProps["color"];
	disabled?: ButtonProps["disabled"];
	onClick?: MouseEventHandler<HTMLButtonElement>;
}
```

**Correct (어느 단계인지 이렇게 고릅니다):**

```txt
래퍼 프롭스에 DOM 표면을 연다
│
├ extends <요소>HTMLAttributes<T> 가 컴파일됨 ──→ 1단계. 그대로 둔다
│
├ 같은 이름 프롭의 값이 부딪혀 막힘 ──────────→ 2단계. 그 이름만 Omit 하고
│                                               인덱스 접근으로 다시 연다
│
└ 감싸는 요소와 이벤트 대상 요소가 서로 다름 ─→ 3단계. extends 없이 필요한 것만
```

**Correct (1단계 — 부딪히는 이름이 없어 그대로 상속합니다):**

```tsx
import {TableCell} from "@mui/material";
import type {TableCellProps} from "@mui/material";
import {clsx} from "clsx";
import type {TdHTMLAttributes} from "react";

/**
 * 표 셀에서 정렬과 여백만 여는 계약
 *
 * 라이브러리 셀의 나머지 표시 프롭은 표 소유자가 정하므로 열지 않는다.
 */
export interface UiTableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
	/**
	 * 내용 가로 정렬
	 */
	align?: TableCellProps["align"];
	/**
	 * 셀 여백
	 */
	padding?: TableCellProps["padding"];
}

export const UiTableCell = (props: UiTableCellProps) => {
	return (
		<TableCell {...props} className={clsx("ui_tableCell__root", props.className)} />
	);
};
```

**Correct (2단계 — 부딪히는 이름만 빼고 다시 엽니다):**

```tsx
import {Button} from "@mui/material";
import type {ButtonProps} from "@mui/material";
import {clsx} from "clsx";
import type {ButtonHTMLAttributes} from "react";

/**
 * 라이브러리 버튼에 우리 클래스 창구만 더한 계약
 *
 * 라이브러리가 `color`를 자기 값 집합으로 좁혀 두어 그 이름만 빼고 다시 연다.
 */
export interface UiButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
	/**
	 * 강조 단계
	 */
	color?: ButtonProps["color"];
}

export const UiButton = (props: UiButtonProps) => {
	return (
		<Button {...props} className={clsx("ui_button__root", props.className)} />
	);
};
```

**Correct (3단계 — 요소 타입이 어긋나 필요한 프롭만 선언합니다):**

```tsx
import {TextField} from "@mui/material";
import type {TextFieldProps} from "@mui/material";
import {clsx} from "clsx";
import type {ChangeEventHandler} from "react";

/**
 * 라벨 없이 값만 받는 한 줄 입력 계약
 *
 * 겉은 `div`인데 이벤트는 안쪽 `input`이 받아 요소 전용 인터페이스를 그대로 못 쓴다.
 */
export interface UiTextFieldProps {
	/**
	 * 최상위에 얹을 클래스
	 */
	className?: string;
	/**
	 * 입력 식별자
	 */
	id?: string;
	/**
	 * 입력값
	 */
	value: string;
	/**
	 * 입력이 바뀔 때
	 */
	onChange: ChangeEventHandler<HTMLInputElement>;
	/**
	 * 오류 표시 여부
	 */
	error?: TextFieldProps["error"];
}

export const UiTextField = (props: UiTextFieldProps) => {
	return (
		<TextField
			className={clsx("ui_textField__root", props.className)}
			id={props.id}
			value={props.value}
			onChange={props.onChange}
			error={props.error}
		/>
	);
};
```
