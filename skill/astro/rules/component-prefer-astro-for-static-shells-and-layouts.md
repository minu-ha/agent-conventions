---
title: Prefer `.astro` for Static Shells and Layouts
impact: CRITICAL
impactDescription: reduces unnecessary client framework surface and keeps Astro's zero-JS default intact
tags: astro-components, layouts, islands
---

## Prefer `.astro` for Static Shells and Layouts

**Impact: CRITICAL (reduces unnecessary client framework surface and keeps Astro's zero-JS default intact)**

state, effect, client runtime가 필요 없는 shell은 기본적으로 `.astro`로 작성합니다.

기준:

- `.astro`: page shell, route shell, wrapper, static content section, document/head helper
- Framework island: browser state, event handler, effect, client-only library가 필요한 leaf
- `src/pages/_document.astro`: top-level document와 shared body shell
- `src/pages/**/_local/*.astro`: 특정 route subtree만 쓰는 route shell

React component를 이미 쓴다는 이유만으로 정적 shell까지 TSX로 밀어 넣지 않습니다.
page content가 주입되는 자리는 `<slot />`로 드러내고, full document shell이라면 `<html>`이 최상위 parent가 되게 유지합니다.

**Incorrect (정적 shell을 React component로 올려 불필요한 framework surface를 늘림):**

```tsx
export const MarketingLayout = ({title, children}: PropsWithChildren<{title: string}>) => {
	return (
		<html lang="ko">
			<body>
				<header>{title}</header>
				<main>{children}</main>
			</body>
		</html>
	);
};
```

**Correct (정적 shell은 `.astro`가 직접 소유하고 interactive leaf만 필요 시 island로 연결):**

```astro
---
const { title } = Astro.props;
---

<html lang="ko">
	<body>
		<header>{title}</header>
		<main>
			<slot />
		</main>
	</body>
</html>
```
