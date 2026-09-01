---
title: Declare Functions as Arrow Consts
titleKo: 함수는 `const` 화살표로 선언하고 본문은 `{}` 블록으로 씁니다
impact: MEDIUM
impactDescription: 선언과 본문 형태가 하나로 고정되어 호이스팅 순서 의존이나 형태가 갈리는 diff가 생기지 않습니다
appliesWhen:
  - 이름을 지어 선언하는 함수를 새로 만들거나 선언 형태나 본문 형태를 바꿀 때
  - 객체 프로퍼티에 함수를 담거나 그 형태를 바꿀 때
  - 제외: 인라인 콜백이나 커링의 바깥 화살표인 경우
  - 제외: 클래스 메서드, 제너레이터, 오버로드 선언인 경우
reviewWith: functions-use-named-object-params-for-complex-signatures
tags: functions, declarations
---

## Declare Functions as Arrow Consts

**Impact: MEDIUM (선언과 본문 형태가 하나로 고정되어 호이스팅 순서 의존이나 형태가 갈리는 diff가 생기지 않습니다)**

함수에 이름을 지어 선언할 때는 `const`에 화살표 함수를 담습니다.
`function` 선언문은 쓰지 않습니다.

- 한 파일 안에서 두 형태를 섞으면 어느 것이 공개 계약인지 형태로 구분할 수 없습니다.
- `function` 선언문은 모듈을 불러오는 시점에도 선언보다 위에서 부를 수 있습니다.
  `const`는 그 자리에서 멈춰 순서가 어긋난 것을 바로 알려 줍니다.

**본문은 `{}` 블록으로 열고 `return`을 적습니다.**
한 줄로 줄여 쓰지 않습니다.
돌려줄 값이 없으면 `return` 없이 블록만 씁니다.

- 줄이 하나 늘어나는 순간 블록으로 다시 감싸야 합니다.
  한 줄을 더한 diff가 함수 전체를 고친 것처럼 보입니다.
- 객체를 돌려줄 때 `({...})`로 괄호를 덧대야 하는 자리가 없어집니다.
- 문서 주석과 본문이 늘 같은 형태로 이어져 선언을 훑을 때 경계가 일정합니다.

두 자리는 이 규범에서 뺍니다.

- 인라인 콜백. `rows.map((row) => row.id)`처럼 이름 없이 그 자리에서 넘기는 함수는 한 줄로 써도 됩니다.
- 커링의 바깥 화살표. 안쪽 함수를 그대로 돌려주는 자리라 블록으로 감싸면 `return`만 늘어납니다.
  `(productId) => (event) => { … }`에서 블록으로 여는 것은 안쪽 하나입니다.

`biome`의 `useConsistentArrowReturn`은 이 형태를 인라인 콜백과 커링에까지 강제해서 켜지 않습니다.
`tooling-configure-biome-to-enforce-these-rules` 규칙이 그 사실과 이유를 적어 둡니다.

**객체 프로퍼티에 담는 함수도 화살표로 씁니다.**
`text(value) { … }` 같은 메서드 축약형은 쓰지 않습니다.
축약형은 `this`가 그 객체에 묶입니다.
`const formatText = cell_formatter_by_value_type.text;`처럼 떼어 내면 `this`가 달라져 동작이 바뀝니다.
화살표 프로퍼티에는 `this`가 없어 떼어 내도 동작이 같습니다.

세 자리는 예외로 둡니다.

| 예외 | 이유 |
| --- | --- |
| 클래스 메서드 | 메서드 문법을 그대로 씁니다. 화살표 필드로 바꾸지 않습니다 |
| 제너레이터 | `function*` 없이 쓸 수 없습니다 |
| 오버로드 선언 | `function` 시그니처를 겹쳐 쓰는 선언 문법은 `const`로 옮길 수 없습니다. 호출 시그니처를 모은 타입을 `const`에 붙일 수 있으면 그쪽을 씁니다 |

**Incorrect (`function` 선언문과 한 줄 본문이 한 파일에 섞입니다):**

```ts
export function toTrimmedTitle(rawTitle: string): string {
	return rawTitle.trim().replace(/\s+/g, " ");
}

export const toProductSlug = (title: string): string => {
	return toTrimmedTitle(title).toLowerCase();
};

export const toProductBadge = (product: Product): ProductBadge => ({
	label: decorate(product.title),
	tone: product.published ? "solid" : "muted",
});

export const toProductLabel = (product: Product): string => {
	return decorate(product.title);
};

function decorate(title: string): string {
	return `# ${title}`;
}
```

**Correct (모두 `const` 화살표에 블록 본문을 씁니다):**

```ts
export const toTrimmedTitle = (rawTitle: string): string => {
	return rawTitle.trim().replace(/\s+/g, " ");
};

export const toProductSlug = (title: string): string => {
	return toTrimmedTitle(title).toLowerCase();
};

export const toProductBadge = (product: Product): ProductBadge => {
	return {
		label: decorate(product.title),
		tone: product.published ? "solid" : "muted",
	};
};

export const toProductLabel = (product: Product): string => {
	return decorate(product.title);
};

const decorate = (title: string): string => {
	return `# ${title}`;
};
```

**Incorrect (객체 프로퍼티의 함수를 메서드 축약형으로 씁니다):**

```ts
export const cell_formatter_by_value_type = {
	text(value: string): string {
		return value.trim();
	},
} as const;
```

**Correct (객체 프로퍼티의 함수는 화살표, 인라인 콜백은 한 줄로 씁니다):**

```ts
export const cell_formatter_by_value_type = {
	/**
	 * 표 셀의 문자열은 앞뒤 공백을 지워 보여 준다
	 */
	text: (value: string): string => {
		return value.trim();
	},
} as const;

export const toProductIds = (products: Product[]): string[] => {
	return products.map((product) => product.id);
};
```

**Correct (클래스 메서드와 제너레이터는 그대로 둡니다):**

```ts
export class ProductCursor {
	private buffer: Product[] = [];

	*pages(): Generator<Product[]> {
		yield this.buffer;
	}

	reset(): void {
		this.buffer = [];
	}
}
```
