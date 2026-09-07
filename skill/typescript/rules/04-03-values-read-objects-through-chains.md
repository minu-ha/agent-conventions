---
title: Read Object Fields Through Chains, Not Destructuring
titleKo: 객체는 구조분해하지 않고 체인으로 읽습니다
impact: HIGH
impactDescription: 값이 어느 객체에서 왔는지가 쓰는 자리마다 남아 이름만 보고 출처를 되짚지 않습니다
appliesWhen:
  - 구조분해로 객체에서 값을 꺼내는 줄을 추가·변경할 때
  - 객체 필드를 별칭 `const`에 담아 그 이름으로 쓰려 할 때
  - 제외: 배열이나 튜플을 자리로 푸는 경우
reviewWith: functions-name-a-value-only-for-recompute-or-judgment
tags: values, origin, destructuring
---

## Read Object Fields Through Chains, Not Destructuring

**Impact: HIGH (값이 어느 객체에서 왔는지가 쓰는 자리마다 남아 이름만 보고 출처를 되짚지 않습니다)**

객체 필드는 구조분해나 별칭 없이 `product.title`처럼 체인으로 읽습니다.
쓰는 자리마다 값의 출처가 남아야 합니다.

| 형태·상황 | 처리 |
| --- | --- |
| 객체 구조분해 | 체인으로 읽습니다. 이름을 바꿔 꺼내는 `{status: projectStatus}`도 같습니다 |
| 같은 필드에 이름만 붙인 지역 `const` | 제거합니다. 필드를 그대로 읽는 것은 계산이 아닙니다 |
| 짧은 함수·좁은 스코프 | 예외를 두지 않습니다 |
| 배열·튜플 구조분해 | 유지합니다. `useState`와 `Object.entries`처럼 위치로 꺼내는 값에는 지워질 필드 이름이 없습니다 |
| 깊어서 읽기 어려운 체인 | 값을 꺼내는 곳에서 별칭으로 끊지 않고, 그 형태를 만드는 곳을 검토합니다 |

계산 결과에 이름을 붙일지는 `functions-name-a-value-only-for-recompute-or-judgment`가 정합니다.

**Incorrect (시그니처와 본문에서 구조분해해 출처가 사라집니다):**

```ts
const toInvoiceLine = ({product, quantity}: InvoiceLineInput): InvoiceLine => {
	const {title, unitPrice} = product;

	return {
		label: title,
		amount: unitPrice * quantity,
	};
};
```

**Incorrect (별칭 `const`로 끊어 이름만 남깁니다):**

```ts
const currency = pricing_default_currency;

const toInvoiceTotal = (lines: InvoiceLine[]): InvoiceTotal => {
	return {
		currency,
		amount: sumBy(lines, (line) => line.amount),
	};
};
```

**Incorrect (이름을 바꿔 꺼내 출처와 원래 이름이 함께 사라집니다):**

```ts
const {status: projectStatus, owner: projectOwner} = project;

if (projectStatus === "archived") {
	notify(projectOwner);
}
```

**Correct (체인으로 읽어 출처가 쓰는 자리마다 남습니다):**

```ts
const toInvoiceLine = (input: InvoiceLineInput): InvoiceLine => {
	return {
		label: input.product.title,
		amount: input.product.unitPrice * input.quantity,
	};
};

const toInvoiceTotal = (lines: InvoiceLine[]): InvoiceTotal => {
	return {
		currency: pricing_default_currency,
		amount: sumBy(lines, (line) => line.amount),
	};
};

if (project.status === "archived") {
	notify(project.owner);
}
```

**Correct (배열과 튜플은 자리로 풀어도 됩니다):**

```ts
const [keyword, setKeyword] = useState("");

for (const [key, value] of Object.entries(target.searchParams)) {
	requestUrl.searchParams.set(key, value);
}
```

**Correct (필드 읽기가 아니라 계산한 결과라 이름을 붙입니다):**

```ts
const toOverdueLines = (invoice: Invoice): InvoiceLine[] => {
	// 콜백 안으로 옮기면 줄마다 다시 만든다
	const overdueIds = new Set(invoice.overdueLineIds);

	return invoice.lines.filter((line) => overdueIds.has(line.id));
};
```
