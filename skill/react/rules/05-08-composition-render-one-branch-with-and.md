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

JSX에서 조건에 따라 무엇을 그릴지는 형태 셋으로 나눕니다.

| 형태 | 쓰는 때 |
| --- | --- |
| 분기마다 `&&`를 따로 적음 | 조건에 따라 JSX 요소를 그릴 때 |
| 이른 반환으로 `null`을 돌려줌 | 컴포넌트가 통째로 아무것도 안 그릴 때. 이 자리에 `&&`를 쓰지 않습니다 |
| 삼항 | JSX 요소가 아니라 문자열·숫자·프롭처럼 값 하나를 고를 때만 |

- 참일 때 그릴 요소와 거짓일 때 그릴 요소를 삼항 하나로 묶지 않습니다.
  각 요소의 표시 조건이 바로 앞에 남아야 합니다.
- 두 조건은 같은 판별값을 기준으로 서로 겹치지 않게 적습니다.
- 분기가 셋 이상이면 섹션 컴포넌트로 나눕니다.
  그 경계는 `screen-extract-local-section-components-for-runtime-boundaries`가 정합니다.
- 숨긴 하위 트리의 상태를 살려야 하면 `composition-use-activity-only-to-preserve-mounted-subtrees`를 봅니다.

**`&&` 왼쪽에 숫자를 두지 않습니다.**
`0`은 거짓이지만 리액트가 화면에 `0`을 그대로 그립니다.
`NaN`도 `NaN`으로 그려집니다.
길이나 개수로 판단할 때는 비교식으로 바꿔 불리언을 만듭니다.

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

**Correct (한 분기는 `&&`, 왼쪽은 불리언입니다):**

```tsx
return <section>{selectedRows.length > 0 && <PgProductBulkActionBar selectedRows={selectedRows} />}</section>;
```

**Correct (컴포넌트가 통째로 안 그리면 이른 반환을 씁니다):**

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
