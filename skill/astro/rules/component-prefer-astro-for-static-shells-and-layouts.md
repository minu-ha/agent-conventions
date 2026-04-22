---
title: Prefer `.astro` for Static Shells and Layouts
impact: CRITICAL
impactDescription: reduces unnecessary client framework surface and keeps Astro's zero-JS default intact
tags: astro-components, layouts, islands
---

## Prefer `.astro` for Static Shells and Layouts

**Impact: CRITICAL (reduces unnecessary client framework surface and keeps Astro's zero-JS default intact)**

state, effect, client runtime가 필요 없는 page shell, layout, wrapper, content section은 기본적으로 `.astro`로 작성합니다. React component를 이미 쓴다는 이유만으로 정적 layout까지 TSX로 밀어 넣지 말고, interactive leaf만 island로 분리합니다. layout이라는 역할은 `src/layouts`에만 둘 필요가 없고, shared owner나 feature owner 아래에 있어도 괜찮습니다. page content가 주입되는 자리는 `<slot />`로 드러내고, full page shell을 만드는 layout이라면 `<html>`이 최상위 parent가 되게 유지합니다.

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
