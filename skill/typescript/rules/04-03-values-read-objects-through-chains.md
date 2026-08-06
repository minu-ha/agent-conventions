---
title: Read Object Fields Through Chains, Not Destructuring
titleKo: 객체는 구조분해하지 않고 체인으로 읽습니다
impact: MEDIUM-HIGH
impactDescription: 값이 어느 객체에서 왔는지가 쓰는 자리마다 남아 이름만 보고 출처를 되짚지 않습니다
appliesWhen:
  - 구조분해로 객체에서 값을 꺼내는 줄을 추가·변경할 때
  - 객체 필드를 별칭 `const`에 담아 그 이름으로 쓰려 할 때
  - 제외: 배열이나 튜플을 자리로 푸는 경우
reviewWith: functions-name-a-value-only-for-recompute-or-judgment
tags: values, origin, destructuring
---

## Read Object Fields Through Chains, Not Destructuring

**Impact: MEDIUM-HIGH (값이 어느 객체에서 왔는지가 쓰는 자리마다 남아 이름만 보고 출처를 되짚지 않습니다)**

객체에서 값을 꺼낼 때 구조분해하지 않고 `product.title`처럼 체인으로 읽습니다.
같은 값에 새 이름만 붙이는 별칭 `const`도 만들지 않습니다.

구조분해와 별칭은 이름만 남기고 출처를 지웁니다.
파일이 길어지면 `title`이 매개변수인지 응답인지 지역 변수인지 읽는 쪽에서 구분할 수 없습니다.
`product.title`은 그 값이 어디서 왔는지를 쓰는 자리마다 다시 말해 줍니다.

**배열과 튜플은 대상이 아닙니다.**
`const [keyword, setKeyword] = useState("")`나
`for (const [key, value] of Object.entries(target))`처럼 자리로 값을 꺼내는 것은 지울 이름이 없습니다.
튜플에는 필드 이름이 없어서 출처가 지워지지 않습니다.

**예외를 두지 않습니다.**
`짧은 함수`나 `좁은 스코프`는 코드를 보고 판정할 수 없는 기준입니다.
줄이 몇 개 늘었다고 판정이 뒤집히는 규칙은 지킬 수 없습니다.

- 이름을 바꿔 꺼내는 것도 구조분해입니다.
  `const {status: projectStatus} = project`는 출처를 지우면서 이름까지 갈아 끼웁니다.
- 계산이 없으면 이름을 붙이지 않습니다.
  `functions-name-a-value-only-for-recompute-or-judgment`가 이름을 붙이라고 하는 것은 계산한 결과입니다.
  필드를 그대로 읽는 것은 계산이 아닙니다.
- 체인이 깊어 읽기 어려우면 꺼내는 자리가 아니라 **그 형태를 만드는 자리**를 봅니다.
  받는 쪽에서 끊는 것으로는 깊이가 줄지 않고 출처만 사라집니다.

**Incorrect (시그니처와 본문에서 구조분해해 출처가 사라짐):**

```ts
const toInvoiceLine = ({product, quantity}: InvoiceLineInput): InvoiceLine => {
	const {title, unitPrice} = product;

	return {
		label: title,
		amount: unitPrice * quantity,
	};
};
```

**Incorrect (별칭 `const`로 끊어 이름만 남김):**

```ts
const pricing = config.pricing;
const currency = pricing.defaultCurrency;

const toInvoiceTotal = (lines: InvoiceLine[]): InvoiceTotal => {
	return {
		currency,
		amount: lines.reduce((sum, line) => sum + line.amount, 0),
	};
};
```

**Incorrect (이름을 바꿔 꺼내 출처와 원래 이름이 함께 사라짐):**

```ts
const {status: projectStatus, owner: projectOwner} = project;

if (projectStatus === "archived") {
	notify(projectOwner);
}
```

**Correct (체인으로 읽어 출처가 쓰는 자리마다 남음):**

```ts
const toInvoiceLine = (input: InvoiceLineInput): InvoiceLine => {
	return {
		label: input.product.title,
		amount: input.product.unitPrice * input.quantity,
	};
};

const toInvoiceTotal = (lines: InvoiceLine[]): InvoiceTotal => {
	return {
		currency: config.pricing.defaultCurrency,
		amount: lines.reduce((sum, line) => sum + line.amount, 0),
	};
};

if (project.status === "archived") {
	notify(project.owner);
}
```

**Correct (배열과 튜플은 자리로 풀어도 됨):**

```ts
const [keyword, setKeyword] = useState("");

for (const [key, value] of Object.entries(target.searchParams)) {
	requestUrl.searchParams.set(key, value);
}
```

**Correct (필드 읽기가 아니라 계산한 결과라 이름을 붙임):**

```ts
const filterOverdueLines = (invoice: Invoice, today: Date): InvoiceLine[] => {
	// 콜백 안으로 옮기면 줄마다 다시 만든다
	const overdueIds = new Set(invoice.overdueLineIds);

	return invoice.lines.filter((line) => overdueIds.has(line.id));
};
```
