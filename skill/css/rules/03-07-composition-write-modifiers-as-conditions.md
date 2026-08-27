---
title: Write Modifiers as Conditions Instead of Assembling Class Names
titleKo: 수정자는 조건으로 적고 클래스 이름을 조립하지 않습니다
impact: MEDIUM-HIGH
impactDescription: 클래스 이름이 코드에 문자열로 남아 CSS와 사용처를 한 번의 검색으로 함께 고칩니다
appliesWhen:
  - 값이나 `variant` 프롭으로 수정자를 고르는 `className`을 추가·변경할 때
  - 클래스 이름에 값을 끼워 넣는 템플릿 리터럴을 추가·변경할 때
  - 제외: 불리언 하나로 수정자가 붙거나 빠지는 경우
reviewWith: >-
  composition-compose-classes-with-clsx, typescript/values-avoid-lookup-tables-for-simple-choices
tags: clsx, className, modifiers
---

## Write Modifiers as Conditions Instead of Assembling Class Names

**Impact: MEDIUM-HIGH (클래스 이름이 코드에 문자열로 남아 CSS와 사용처를 한 번의 검색으로 함께 고칩니다)**

수정자는 조건으로 적습니다.
클래스 이름을 값으로 조립하지 않습니다.

| 이렇게 적습니다 | 이렇게 적지 않습니다 |
| --- | --- |
| `tone === "positive" && "pg_salesPanel__metricValue--positive"` | `` `pg_salesPanel__metricValue--${tone}` `` |

조립하면 그 클래스 이름이 코드에 남지 않습니다.
CSS에서 수정자를 지울 때 그 클래스를 쓰는 자리가 검색에 걸리지 않습니다.

값이 여럿이면 값마다 한 줄씩 나열합니다.
줄 몇 개를 더 쓰는 것이 클래스 이름을 잃는 것보다 낫습니다.
같은 값으로 요소 여러 개에 수정자를 붙일 때도 요소마다 나열합니다.

나열에는 CSS에 있는 수정자만 적습니다.
값이 다섯인데 CSS에 수정자가 둘뿐이면 그 둘만 적습니다.
나머지 값은 기본 모습으로 남습니다.

`ButtonProps["variant"]`처럼 라이브러리 타입을 그대로 받는 값으로는 수정자를 만들지 않습니다.
라이브러리가 값을 더하면 우리 나열에는 그 값이 없어서 클래스가 붙지 않습니다.
그 값이 만드는 모습은 라이브러리에 맡기고, 우리 모습이 필요하면 우리 어휘로 만든 프롭을 따로 받습니다.

수정자를 붙일 자격은 `composition-do-not-build-structural-variants-with-modifiers` 규칙이 정합니다.
여기서는 붙이기로 정한 수정자를 어떤 형태로 적을지만 봅니다.

**Incorrect (클래스 이름을 값으로 조립함):**

```tsx
export const UiTooltip = (props: UiTooltipProps) => {
	return (
		<div className={clsx("ui_tooltip__body", props.variant && `ui_tooltip__body--${props.variant}`)}>
			{props.children}
		</div>
	);
};
```

**Incorrect (수정자가 없는 값까지 조립해 CSS에 없는 클래스를 붙임):**

```tsx
type SalesTone = "positive" | "negative" | "neutral" | "unknown";

<span className={clsx("pg_salesPanel__metricValue", `pg_salesPanel__metricValue--${tone}`)}>{amount}</span>;
```

```css
.pg_salesPanel__metricValue--positive {
	color: var(--app-color-rise, #d32f2f);
}

.pg_salesPanel__metricValue--negative {
	color: var(--app-color-fall, #1976d2);
}
```

**Incorrect (라이브러리가 정하는 값으로 수정자를 만듦):**

```tsx
export interface UiButtonProps {
	variant?: ButtonProps["variant"];
	className?: string;
}

export const UiButton = (props: UiButtonProps) => {
	return <Button className={clsx("ui_button__root", `ui_button__root--${props.variant}`, props.className)} />;
};
```

**Correct (값마다 한 줄로 나열함):**

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

**Correct (CSS에 수정자가 있는 두 값만 적고 나머지는 기본 모습을 씀):**

```tsx
<span
	className={clsx(
		"pg_salesPanel__metricValue",
		tone === "positive" && "pg_salesPanel__metricValue--positive",
		tone === "negative" && "pg_salesPanel__metricValue--negative",
	)}
>
	{amount}
</span>;
```

**Correct (라이브러리가 정하는 값은 수정자로 만들지 않고 그대로 넘김):**

```tsx
export const UiButton = (props: UiButtonProps) => {
	return <Button className={clsx("ui_button__root", props.className)} variant={props.variant} />;
};
```

**Correct (같은 값이 요소 셋의 수정자를 정하면 요소마다 나열을 반복함):**

```tsx
export interface WgFlowNodeProps {
	role: "trigger" | "condition";
	label: string;
	description: string;
}

export const WgFlowNode = (props: WgFlowNodeProps) => {
	return (
		<div
			className={clsx(
				"wg_flowNode__root",
				props.role === "trigger" && "wg_flowNode__root--trigger",
				props.role === "condition" && "wg_flowNode__root--condition",
			)}
		>
			<span
				className={clsx(
					"wg_flowNode__title",
					props.role === "trigger" && "wg_flowNode__title--trigger",
					props.role === "condition" && "wg_flowNode__title--condition",
				)}
			>
				{props.label}
			</span>
			<p
				className={clsx(
					"wg_flowNode__description",
					props.role === "trigger" && "wg_flowNode__description--trigger",
					props.role === "condition" && "wg_flowNode__description--condition",
				)}
			>
				{props.description}
			</p>
		</div>
	);
};
```
