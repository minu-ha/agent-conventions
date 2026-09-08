---
title: Write Modifiers as Conditions Instead of Assembling Class Names
titleKo: 수정자는 조건으로 적고 클래스 이름을 조립하지 않습니다
impact: HIGH
impactDescription: 클래스 이름이 코드에 문자열로 남아 CSS와 사용처를 한 번의 검색으로 함께 고칩니다
appliesWhen:
  - 값이나 `variant` 프롭으로 수정자를 고르는 `className`을 추가 · 변경할 때
  - 클래스 이름에 값을 끼워 넣는 템플릿 리터럴을 추가 · 변경할 때
  - 제외: 불리언 하나로 수정자가 붙거나 빠지는 경우
reviewWith: >-
  composition-compose-classes-with-clsx, typescript/values-avoid-lookup-tables-for-simple-choices
tags: clsx, className, modifiers
---

## Write Modifiers as Conditions Instead of Assembling Class Names

**Impact: HIGH (클래스 이름이 코드에 문자열로 남아 CSS와 사용처를 한 번의 검색으로 함께 고칩니다)**

수정자는 조건과 완성된 클래스 문자열로 적습니다.
값을 끼워 이름을 조립하면 CSS와 사용처를 같은 문자열로 검색할 수 없습니다.

| 상황 | 작성 방법 |
| --- | --- |
| 값 하나에 수정자를 붙임 | `tone === "positive" && "pg_products__changeRate--positive"`처럼 씁니다. 템플릿 리터럴로 이름을 조립하지 않습니다 |
| 값이 여럿임 | 값마다 한 줄씩 적습니다. 여러 요소에 같은 값을 적용해도 요소마다 나열합니다 |
| 일부 값에만 CSS 수정자가 있음 | 해당 값만 나열하고 나머지는 기본 모습으로 둡니다. 값이 다섯이고 수정자가 둘이면 둘만 적습니다 |
| `ButtonProps["variant"]`처럼 라이브러리 타입을 그대로 받음 | 수정자를 만들지 않고 라이브러리에 넘깁니다. 라이브러리가 추가한 값을 우리 목록이 놓칠 수 있습니다 |
| 라이브러리와 별개인 우리 모습이 필요함 | 우리 어휘로 정의한 프롭을 따로 받습니다 |

수정자를 붙일 수 있는지는 `composition-do-not-build-structural-variants-with-modifiers` 규칙이 판단합니다.
이 규칙은 허용한 수정자의 작성 형식을 정합니다.

**Incorrect (클래스 이름을 값으로 조립합니다):**

```tsx
export interface UiTooltipProps {
	variant?: "fit" | "plain";
	children: ReactNode;
}

export const UiTooltip = (props: UiTooltipProps) => {
	return (
		<div className={clsx("ui_tooltip__body", props.variant && `ui_tooltip__body--${props.variant}`)}>
			{props.children}
		</div>
	);
};
```

**Correct (값마다 한 줄로 나열합니다):**

```tsx
export interface UiTooltipProps {
	variant?: "fit" | "plain";
	children: ReactNode;
}

export const UiTooltip = (props: UiTooltipProps) => {
	return (
		<div
			className={clsx(
				"ui_tooltip__body",
				props.variant === "fit" && "ui_tooltip__body--fit",
				props.variant === "plain" && "ui_tooltip__body--plain",
			)}
		>
			{props.children}
		</div>
	);
};
```

**Incorrect (라이브러리가 정하는 값으로 수정자를 만듭니다):**

```tsx
export interface UiButtonProps {
	variant?: ButtonProps["variant"];
	className?: string;
}

export const UiButton = (props: UiButtonProps) => {
	return <Button className={clsx("ui_button__root", `ui_button__root--${props.variant}`, props.className)} />;
};
```

**Correct (라이브러리가 정하는 값은 수정자로 만들지 않고 그대로 넘깁니다):**

```tsx
export interface UiButtonProps {
	variant?: ButtonProps["variant"];
	className?: string;
}

export const UiButton = (props: UiButtonProps) => {
	return <Button className={clsx("ui_button__root", props.className)} variant={props.variant} />;
};
```
**Incorrect (수정자가 없는 값까지 조립해 CSS에 없는 클래스를 붙입니다):**

```tsx
type Tone = "positive" | "negative" | "neutral" | "unknown";

<span className={clsx("pg_products__changeRate", `pg_products__changeRate--${tone}`)}>{amount}</span>;
```

```css
.pg_products__changeRate--positive {
	color: var(--app-color-rise);
}

.pg_products__changeRate--negative {
	color: var(--app-color-fall);
}
```

**Correct (CSS에 수정자가 있는 두 값만 적고 나머지는 기본 모습을 씁니다):**

```tsx
<span
	className={clsx(
		"pg_products__changeRate",
		tone === "positive" && "pg_products__changeRate--positive",
		tone === "negative" && "pg_products__changeRate--negative",
	)}
>
	{amount}
</span>;
```

**Correct (같은 값이 요소 셋의 수정자를 정하면 요소마다 나열을 반복합니다):**

```tsx
export interface WgUserCardProps {
	role: "owner" | "member";
	label: string;
	description: string;
}

export const WgUserCard = (props: WgUserCardProps) => {
	return (
		<div
			className={clsx(
				"wg_userCard__root",
				props.role === "owner" && "wg_userCard__root--owner",
				props.role === "member" && "wg_userCard__root--member",
			)}
		>
			<span
				className={clsx(
					"wg_userCard__title",
					props.role === "owner" && "wg_userCard__title--owner",
					props.role === "member" && "wg_userCard__title--member",
				)}
			>
				{props.label}
			</span>
			<p
				className={clsx(
					"wg_userCard__description",
					props.role === "owner" && "wg_userCard__description--owner",
					props.role === "member" && "wg_userCard__description--member",
				)}
			>
				{props.description}
			</p>
		</div>
	);
};
```

