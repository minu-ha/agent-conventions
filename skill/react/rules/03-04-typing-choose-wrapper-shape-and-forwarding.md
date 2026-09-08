---
title: Choose the Wrapper Shape and Forward Props Accordingly
titleKo: 래퍼 형태를 고르고 조건이 맞을 때만 `{...props}`로 넘깁니다
impact: HIGH
impactDescription: 각 프롭이 전달되는 요소를 코드에서 확인할 수 있습니다
appliesWhen:
  - 래퍼가 받은 프롭을 안쪽 컴포넌트나 요소로 넘기는 코드를 추가 · 변경할 때
  - 래퍼에 자기 프롭을 더하거나 안쪽 요소를 늘릴 때
requiresSelected: typing-narrow-library-wrapper-contracts
reviewWith: typescript/values-avoid-lookup-tables-for-simple-choices
tags: typing, wrapper, contracts
---

## Choose the Wrapper Shape and Forward Props Accordingly

**Impact: HIGH (각 프롭이 전달되는 요소를 코드에서 확인할 수 있습니다)**

기본은 프롭을 이름으로 하나씩 전달하는 것입니다.
`{...props}`는 아래 세 조건을 **모두** 만족할 때만 씁니다.

| 조건 | 확인 방법 |
| --- | --- |
| 안쪽 요소가 하나임 | 반환하는 JSX에 요소가 하나입니다 |
| 자기 프롭이 없음 | 선언한 프롭을 안쪽 컴포넌트가 전부 받습니다. 구분은 `typing-narrow-library-wrapper-contracts`를 따릅니다 |
| DOM 속성을 `extends`로 열 수 있음 | `typing-open-dom-props-in-three-steps`의 1 · 2단계입니다 |

자기 프롭이 있으면 3단계처럼 전달할 DOM 프롭만 선언하고, 전부 이름으로 넘깁니다.
스프레드는 초과 프롭을 검사하지 않으므로 리뷰에서 확인합니다.
안쪽 라이브러리가 걸러 주지 않으면 `icon` 같은 자기 프롭이 DOM에 새거나 잘못된 값 경고가 날 수 있습니다.

| 계약이 커지는 상황 | 처리 |
| --- | --- |
| 라이브러리 API를 따라 프롭이 서른 개로 늘어날 것 같음 | 우리 어휘로 계약을 다시 쓰고 라이브러리 어휘는 구현 안에 둡니다 |
| 그래도 프롭 수가 줄지 않음 | `strategy-choose-single-composition-compound-and-variants`에 따라 쓰임새별 변형으로 나눕니다 |
| 안쪽 부품을 외부에서 조립해야 함 | `headerProps`, `buttonProps` 같은 내부 프롭 묶음을 만들지 않고 `strategy-prefer-children-over-render-props`에 따라 `children`으로 엽니다 |

내부 프롭 묶음을 공개하면 사용처가 안쪽 구조에 의존해 내부 변경 때 함께 깨집니다.
구조분해 기준은 `composition-read-props-without-destructuring`을 따릅니다.

**Incorrect (자기 프롭까지 스프레드로 전달합니다):**

```tsx
export interface UiIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	icon: ReactNode;
}

// 안쪽 컴포넌트가 걸러 주지 않으면 icon이 DOM까지 내려간다. 컴파일은 통과한다
export const UiIconButton = (props: UiIconButtonProps) => {
	return (
		<Button {...props}>
			{props.icon}
			{props.children}
		</Button>
	);
};
```

**Correct (자기 프롭이 있으므로 프롭을 이름으로 전달합니다):**

```tsx
/**
 * 아이콘만 있는 버튼
 *
 * `icon`과 `label`은 안쪽 컴포넌트가 모르는 자기 프롭이라 타입을 직접 적는다.
 * `disabled`는 라이브러리에 이미 있어 인덱스 접근으로 가져온다.
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
	 * 스크린 리더가 읽을 이름. `aria-label`로 내려간다
	 */
	label: string;
	/**
	 * 비활성 여부
	 */
	disabled?: ButtonProps["disabled"];
	/**
	 * 눌렀을 때
	 */
	onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const UiIconButton = (props: UiIconButtonProps) => {
	return (
		<Button
			className={clsx("ui_iconButton__root", props.className)}
			aria-label={props.label}
			disabled={props.disabled}
			onClick={props.onClick}
		>
			{props.icon}
		</Button>
	);
};
```

**Correct (서로 다른 요소에 프롭을 이름으로 전달합니다):**

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

export const UiField = (props: UiFieldProps) => {
	return (
		<div className={clsx("ui_field__root", props.className)}>
			<label className={clsx("ui_field__label")} htmlFor={props.inputId}>
				{props.label}
			</label>
			<input id={props.inputId} value={props.value} onChange={props.onChange} />
			{props.helperText && <span className={clsx("ui_field__helper")}>{props.helperText}</span>}
		</div>
	);
};
```

**Correct (세 조건을 모두 만족하여 스프레드로 전달합니다):**

```tsx
/**
 * 표 줄
 *
 * 감싸는 컴포넌트의 프롭이 DOM 계약과 호환되어 `HTMLAttributes`를 그대로 받을 수 있다.
 */
export interface UiTableRowProps extends HTMLAttributes<HTMLTableRowElement> {
	/**
	 * 선택된 줄로 표시할지
	 */
	selected?: TableRowProps["selected"];
}

export const UiTableRow = (props: UiTableRowProps) => {
	return (
		<TableRow {...props} className={clsx("ui_tableRow__root", props.className)} />
	);
};
```
