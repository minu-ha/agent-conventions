---
title: Write Fragments as `Fragment`, Not the Shorthand
titleKo: 빈 태그 대신 `Fragment`를 그대로 씁니다
impact: MEDIUM
impactDescription: 조각을 감싼 자리가 이름을 가져서 검색과 diff에 그대로 드러납니다
appliesWhen:
  - JSX에서 여러 요소를 감쌀 조각 문법을 추가·변경할 때
  - 조각에 `key`를 붙이거나 떼어 낼 때
tags: composition, jsx
---

## Write Fragments as `Fragment`, Not the Shorthand

**Impact: MEDIUM (조각을 감싼 자리가 이름을 가져서 검색과 diff에 그대로 드러납니다)**

여러 요소를 감쌀 때는 `<Fragment>`를 `react`에서 직접 가져와 그대로 씁니다.
`<>`와 `</>`는 쓰지 않습니다.

- `<>`와 `</>`는 검색해도 어느 컴포넌트의 조각인지 가릴 수 없습니다.
  diff에도 이름 없는 줄로 남습니다.
- 목록에서 `key`가 필요해지면 어차피 `<Fragment key={…}>`로 바꿔야 합니다.
  한 형태로 끝냅니다.
- 가져오기는 `typescript/naming-use-direct-imports-and-public-entry-points`를 따라
  `import { Fragment } from "react";`로 적습니다.

`biome`의 `style/useFragmentSyntax`는 정반대를 강제하므로 켜지 않습니다.
설정은 `typescript/tooling-configure-biome-to-enforce-these-rules`에 적혀 있습니다.

**Incorrect (이름 없는 짧은 문법):**

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

**Correct (`Fragment`를 그대로 씀):**

```tsx
import { Fragment } from "react";

export const PgProductScreen = () => {
	return (
		<Fragment>
			<PgProductFilterSection />
			<PgProductTableSection />
		</Fragment>
	);
};
```

**Correct (`key`가 필요해도 같은 형태를 유지):**

```tsx
import { Fragment } from "react";

export const PgProductRows = (props: PgProductRowsProps) => {
	return props.products.map((product) => (
		<Fragment key={product.id}>
			<PgProductRow product={product} />
			<PgProductRowDivider />
		</Fragment>
	));
};
```
