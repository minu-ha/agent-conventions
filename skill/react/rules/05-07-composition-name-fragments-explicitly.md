---
title: Write Fragments as `Fragment`, Not the Shorthand
titleKo: `<>` 단축 문법 대신 `Fragment`를 그대로 씁니다
impact: MEDIUM
impactDescription: Fragment를 검색하고 변경 내역에서 식별하기 쉽습니다
appliesWhen:
  - JSX에서 여러 요소를 `Fragment`나 `<>`로 감싸는 문법을 추가, 변경할 때
  - `Fragment`에 `key`를 붙이거나 떼어 낼 때
tags: composition, jsx
---

## Write Fragments as `Fragment`, Not the Shorthand

**Impact: MEDIUM (Fragment를 검색하고 변경 내역에서 식별하기 쉽습니다)**

여러 요소를 감쌀 때는 `react`에서 가져온 `<Fragment>`를 쓰고 `<>`, `</>`는 쓰지 않습니다.
검색과 diff에 이름을 남기고, 목록에서 `key`가 필요해져도 `<Fragment key={…}>` 형태를 유지합니다.

가져오기는 `typescript/naming-use-direct-imports-and-public-entry-points`에 따라
`import {Fragment} from "react";`로 적습니다.
`<>`를 강제하는 `biome`의 `style/useFragmentSyntax`는 켜지 않습니다.
설정은 `typescript/tooling-configure-biome-to-enforce-these-rules`를 따릅니다.

**Incorrect 1 (`Fragment` 단축 문법을 씁니다):**

```tsx
export const PgProductScreen = () => {
	return (
		<>
			<PgProductFilterSection />
			<PgProductTableSection />
		</>
	);
};
```

**Correct 1 (`Fragment`를 그대로 씁니다):**

```tsx
import {Fragment} from "react";

export const PgProductScreen = () => {
	return (
		<Fragment>
			<PgProductFilterSection />
			<PgProductTableSection />
		</Fragment>
	);
};
```

**Incorrect 2 (목록에서도 짧은 문법을 써서 `key`를 붙일 자리가 없습니다):**

```tsx
export const PgProductRows = (props: PgProductRowsProps) => {
	return props.products.map((product) => (
		<>
			<PgProductRow product={product} />
			<PgProductRowDivider />
		</>
	));
};
```

**Correct 2 (`key`가 필요해도 같은 형태를 씁니다):**

```tsx
import {Fragment} from "react";

export const PgProductRows = (props: PgProductRowsProps) => {
	return props.products.map((product) => (
		<Fragment key={product.id}>
			<PgProductRow product={product} />
			<PgProductRowDivider />
		</Fragment>
	));
};
```
