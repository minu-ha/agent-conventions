# Write Fragments as `Fragment`, Not the Shorthand

**Impact: MEDIUM (Fragment를 검색하고 변경 내역에서 식별하기 쉽습니다)**

여러 요소를 감쌀 때는 `react`에서 가져온 `<Fragment>`를 쓰고 `<>` · `</>`는 쓰지 않습니다.
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

> 나머지 예시 · 예외는 [full rule](../rules/05-07-composition-name-fragments-explicitly.md)에 있습니다.
