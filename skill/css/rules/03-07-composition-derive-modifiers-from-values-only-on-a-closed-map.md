---
title: Derive Modifier Names From Values Only on a Closed Map
titleKo: 수정자 이름은 닫힌 1:1 대응일 때만 값으로 만듭니다
impact: MEDIUM-HIGH
impactDescription: CSS에 없는 클래스가 DOM에 붙거나 값이 늘 때 수정자가 조용히 빠지지 않습니다
appliesWhen:
  - 값이나 `variant` 프롭으로 수정자를 고르는 `className`을 추가·변경할 때
  - 클래스 이름에 값을 끼워 넣는 템플릿 리터럴을 추가·변경할 때
  - 제외: 불리언 하나로 수정자가 붙거나 빠지는 경우
reviewWith: >-
  composition-compose-classes-with-clsx, typescript/values-avoid-lookup-tables-for-simple-choices
tags: clsx, className, modifiers
---

## Derive Modifier Names From Values Only on a Closed Map

**Impact: MEDIUM-HIGH (CSS에 없는 클래스가 DOM에 붙거나 값이 늘 때 수정자가 조용히 빠지지 않습니다)**

수정자는 `조건 && "클래스"`로 적습니다.
클래스 이름이 문자열 그대로 남아 CSS와 사용처가 같은 검색에 함께 걸립니다.

값으로 이름을 만들지 따지는 것은 **한 값이 요소 둘 이상의 수정자를 정할 때**뿐입니다.
요소가 하나면 나열은 값 수만큼이고 값을 더할 자리도 한 곳이라 `&&`로 적습니다.
요소마다 나열하면 값 하나를 더할 때 고칠 자리가 요소 수만큼 늘고, 한 곳을 빠뜨려도 조용히 지나갑니다.

요소가 둘 이상이어도 아래 셋을 모두 만족해야 값으로 이름을 만듭니다.

| 확인할 것 | 통과 조건 |
| --- | --- |
| 값의 범위 | 우리가 값을 다 아는 닫힌 집합입니다 |
| CSS 대응 | 값마다 대응하는 수정자가 CSS에 있습니다 |
| 낱말 | 값과 수정자가 같은 낱말입니다 |

세 조건은 CSS 파일을 열어 확인합니다.
확인하지 못했으면 `&&`로 적습니다.

수정자가 없는 값이 하나라도 섞여 있으면 CSS에 없는 클래스가 DOM에 붙습니다.
`"정상"` 같은 도메인 값을 `--normal`로 옮기는 자리는 낱말이 다르므로 `&&`로 적습니다.
값이 없을 수 있으면 그 값을 먼저 확인하는 `&&`를 앞에 두어 `--undefined`가 붙지 않게 합니다.

라이브러리 타입에서 그대로 열어 받은 값으로는 수정자를 만들지 않습니다.
라이브러리가 값을 더하면 따라 넓어지는 집합이라 값 전부에 수정자가 있다고 보장할 수 없습니다.
하나씩 나열하면 값이 늘 때 수정자가 조용히 빠지고, 끼워 넣으면 CSS에 없는 클래스가 붙습니다.
그 값이 만드는 모습은 라이브러리에 맡기고, 우리 모습이 필요하면 우리 어휘로 만든 프롭을 따로 받습니다.

수정자를 붙일 자격이 있는지는 `composition-do-not-build-structural-variants-with-modifiers` 규칙이 정합니다.
여기서는 붙이기로 정한 수정자를 어떤 형태로 적을지만 봅니다.

**Incorrect (수정자를 붙일 요소가 하나뿐인데 값으로 이름을 만듦):**

```tsx
export const UiTooltip = (props: UiTooltipProps) => {
	return (
		<div className={clsx("ui_tooltip__body", props.variant && `ui_tooltip__body--${props.variant}`)}>
			{props.children}
		</div>
	);
};
```

**Incorrect (수정자가 없는 값이 섞여 있는데 값으로 이름을 만듦):**

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

**Incorrect (라이브러리가 정하는 값으로 수정자 이름을 만듦):**

```tsx
export interface UiButtonProps {
	variant?: ButtonProps["variant"];
	className?: string;
}

export const UiButton = (props: UiButtonProps) => {
	return <Button className={clsx("ui_button__root", `ui_button__root--${props.variant}`, props.className)} />;
};
```

```css
.ui_button__root {
	min-inline-size: 0;
}
```

**Correct (요소가 하나면 값이 둘이어도 조건으로 나열함):**

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

```css
.ui_tooltip__body--fit {
	inline-size: fit-content;
}

.ui_tooltip__body--plain {
	background: var(--app-color-surface, #ffffff);
}
```

**Correct (CSS에 있는 수정자만 조건으로 나열함):**

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

**Correct (한 값이 요소 넷의 수정자를 정하고 값마다 수정자가 CSS에 있어 값으로 이름을 만듦):**

```tsx
export interface WgFlowNodeProps {
	role: "trigger" | "condition" | "output";
	label: string;
	description: string;
}

export const WgFlowNode = (props: WgFlowNodeProps) => {
	return (
		<div className={clsx("wg_flowNode__root", `wg_flowNode__root--${props.role}`)}>
			<div className={clsx("wg_flowNode__header", `wg_flowNode__header--${props.role}`)}>
				<span className={clsx("wg_flowNode__title", `wg_flowNode__title--${props.role}`)}>{props.label}</span>
			</div>
			<p className={clsx("wg_flowNode__description", `wg_flowNode__description--${props.role}`)}>{props.description}</p>
		</div>
	);
};
```
