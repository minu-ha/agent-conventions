---
title: Choose the Wrapper Shape and Forward Props Accordingly
titleKo: 래퍼 형태를 고르고 그에 맞게 프롭을 넘깁니다
impact: HIGH
impactDescription: 프롭이 엉뚱한 요소로 흘러가지 않고 어디로 가는지가 코드에 남습니다
appliesWhen:
  - 래퍼가 받은 프롭을 안쪽 컴포넌트나 요소로 넘기는 코드를 추가·변경할 때
  - 래퍼에 자기 프롭을 더하거나 안쪽 요소를 늘릴 때
requiresSelected: typing-narrow-library-wrapper-contracts
tags: typing, wrapper, contracts
---

## Choose the Wrapper Shape and Forward Props Accordingly

**Impact: HIGH (프롭이 엉뚱한 요소로 흘러가지 않고 어디로 가는지가 코드에 남습니다)**

**기본은 이름으로 하나씩 넘기는 것입니다.**
어느 프롭이 어느 요소로 가는지가 코드에 그대로 남습니다.

`{...props}`는 **아래 셋을 모두 만족할 때만** 씁니다.

| 조건 | 확인하는 방법 |
| --- | --- |
| 안쪽 요소가 하나다 | 반환하는 JSX에 요소가 하나입니다 |
| **자기 프롭**이 하나도 없다 | 선언한 프롭을 안쪽 컴포넌트가 전부 받습니다 |
| `extends HTMLAttributes<T>`가 컴파일된다 | `typing-narrow-library-wrapper-contracts`가 정합니다 |

**자기 프롭**은 안쪽 컴포넌트가 받지 않는 프롭입니다.
`UiIconButtonProps`의 `icon`은 `ButtonBase`가 모르므로 자기 프롭이고,
`UiTableRowProps`의 `selected`는 `TableRow`가 받으므로 자기 프롭이 아닙니다.

**자기 프롭이 있는데 `{...props}`를 쓰면 그 프롭이 DOM까지 내려갑니다.**
`icon`이 `<button icon="…">`이 되어 리액트가 경고합니다.
JSX 스프레드는 초과 프롭를 검사하지 않아 **컴파일러가 잡아 주지 않습니다.** 리뷰가 봐야 합니다.

라이브러리 API가 커서 프롭이 서른 개로 늘어날 것 같으면 만능 래퍼를 만들지 않습니다.
우리 어휘로 계약을 다시 쓰고 라이브러리 어휘는 본문 안에서만 씁니다.
그래도 줄지 않으면 `strategy-choose-single-composition-compound-and-variants`를 따라
쓰임새별 변형으로 쪼갭니다.

`headerProps`, `buttonProps`처럼 안쪽 부품으로 가는 프롭 묶음을 만들지 않습니다.
사용처가 내부 구조를 알게 되어 안쪽을 바꿀 때 함께 깨집니다.
안쪽을 밖에서 조립해야 하면 `strategy-prefer-children-over-render-props`를 따라 `children`으로 엽니다.

구조분해는 어느 형태에서도 하지 않습니다.
`{...props}`는 `props`를 그대로 읽어 펼치는 것이라 `composition-read-props-without-destructuring` 대상이 아닙니다.

**Incorrect (자기 프롭을 더해 놓고 스프레드로 넘김):**

```tsx
export interface UiIconButtonProps extends HTMLAttributes<HTMLButtonElement> {
	icon: ReactNode;
}

// icon 이 <button icon="…"> 으로 내려간다. 컴파일은 통과한다
export const UiIconButton = (props: UiIconButtonProps) => (
	<ButtonBase {...props}>
		{props.icon}
		{props.children}
	</ButtonBase>
);
```

**Correct (자기 프롭이 있으면 이름으로 넘김):**

```tsx
/**
 * 아이콘만 있는 버튼
 */
export interface UiIconButtonProps {
	/**
	 * 최상위에 얹을 클래스
	 */
	className?: string;
	/**
	 * 버튼 안에 그릴 아이콘
	 */
	icon: ReactNode;
	/**
	 * 화면 낭독기가 읽을 이름
	 */
	label: string;
	/**
	 * 눌렀을 때
	 */
	onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const UiIconButton = (props: UiIconButtonProps) => (
	<ButtonBase
		className={clsx("ui_iconButton__root", props.className)}
		aria-label={props.label}
		onClick={props.onClick}
	>
		{props.icon}
	</ButtonBase>
);
```

**Correct (안쪽 요소가 여럿이면 각각 갈 곳에 이름으로 넘김):**

```tsx
/**
 * 라벨과 보조 설명을 붙인 입력 한 줄
 */
export interface UiFieldProps {
	/**
	 * 최상위에 얹을 클래스
	 */
	className?: string;
	/**
	 * 입력 위에 붙는 라벨
	 */
	label: string;
	/**
	 * 입력 아래 보조 설명
	 */
	helperText?: string;
	/**
	 * 라벨과 입력을 잇는 id
	 */
	inputId: string;
	/**
	 * 입력값
	 */
	value: string;
	/**
	 * 입력이 바뀔 때
	 */
	onChange: ChangeEventHandler<HTMLInputElement>;
}

export const UiField = (props: UiFieldProps) => (
	<div className={clsx("ui_field__root", props.className)}>
		<label className={clsx("ui_field__label")} htmlFor={props.inputId}>
			{props.label}
		</label>
		<TextField id={props.inputId} value={props.value} onChange={props.onChange} />
		{props.helperText ? (
			<span className={clsx("ui_field__helper")}>{props.helperText}</span>
		) : null}
	</div>
);
```

**Correct (셋을 모두 만족해 스프레드로 끝냄):**

```tsx
/**
 * 표 줄
 *
 * TableRow는 `color`를 좁히지 않아 `HTMLAttributes`를 그대로 받을 수 있다.
 */
export interface UiTableRowProps extends HTMLAttributes<HTMLTableRowElement> {
	/**
	 * 선택된 줄로 표시할지
	 */
	selected?: TableRowProps["selected"];
}

export const UiTableRow = (props: UiTableRowProps) => (
	<TableRow {...props} className={clsx("ui_table__row", props.className)} />
);
```
