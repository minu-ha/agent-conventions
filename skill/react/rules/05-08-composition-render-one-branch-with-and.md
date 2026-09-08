---
title: Render JSX Branches With Explicit Conditions
titleKo: JSX 분기는 조건을 각각 적습니다
impact: HIGH
impactDescription: 각 요소 바로 앞에 표시 조건이 남아 화면 분기를 바로 읽을 수 있습니다
appliesWhen:
  - JSX 안에 조건부 렌더링을 추가하거나 조건식을 바꿀 때
  - 기존 JSX 삼항이나 `조건 && …`을 넣거나 뺄 때
tags: composition, jsx
---

## Render JSX Branches With Explicit Conditions

**Impact: HIGH (각 요소 바로 앞에 표시 조건이 남아 화면 분기를 바로 읽을 수 있습니다)**

JSX 분기는 각 요소 바로 앞에 표시 조건이 드러나도록 적습니다.

| 표현할 내용 | 형태 |
| --- | --- |
| 조건에 따라 JSX 요소를 표시함 | 분기마다 `&&`를 따로 씁니다. 참 · 거짓 요소를 삼항 하나로 묶지 않습니다 |
| 컴포넌트 전체를 표시하지 않음 | `&&` 대신 이른 반환으로 `null`을 반환합니다 |
| 문자열 · 숫자 · 프롭 등 값 하나를 고름 | 이때만 삼항을 씁니다 |

서로 다른 분기는 같은 판별값을 기준으로 조건이 겹치지 않게 적습니다.
숨긴 하위 트리의 상태를 보존해야 하면 `composition-use-activity-only-to-preserve-mounted-subtrees`를 따릅니다.

`&&` 왼쪽에는 숫자를 두지 않습니다. 거짓으로 평가되는 `0`과 `NaN`도 화면에 그대로 렌더됩니다.
길이 · 개수는 비교식으로 바꿔 불리언으로 판단합니다.

**Incorrect (JSX 두 분기를 삼항 하나로 묶습니다):**

```tsx
return (
	<section>
		{props.view === "chart" ? <PgChart /> : <PgTable />}
	</section>
);
```

**Correct (각 JSX 요소 앞에 표시 조건을 둡니다):**

```tsx
return (
	<section>
		{props.view === "chart" && <PgChart />}
		{props.view === "table" && <PgTable />}
	</section>
);
```

**Incorrect (`&&` 왼쪽에 숫자를 둬서 `0`이 그려집니다):**

```tsx
return <section>{selectedRows.length && <PgProductBulkActionBar />}</section>;
```

**Correct (`&&` 왼쪽에 불리언 비교식을 씁니다):**

```tsx
return <section>{selectedRows.length > 0 && <PgProductBulkActionBar selectedRows={selectedRows} />}</section>;
```

**Incorrect (컴포넌트 전체를 표시하지 않을 때 `&&`를 씁니다):**

```tsx
const PgProductPanel = (props: PgProductPanelProps) => {
	return props.isVisible && <section className={clsx("pg_productPanel__root")}>{props.children}</section>;
};
```

**Correct (컴포넌트 전체를 표시하지 않으면 이른 반환합니다):**

```tsx
const PgProductPanel = (props: PgProductPanelProps) => {
	if (!props.isVisible) {
		return null;
	}

	return <section className={clsx("pg_productPanel__root")}>{props.children}</section>;
};
```

**Correct (프롭 값 하나는 삼항으로 고릅니다):**

```tsx
return <UiBadge tone={props.isSelected ? "accent" : "neutral"} />;
```
