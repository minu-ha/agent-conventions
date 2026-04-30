---
title: Prefer `.astro` for Static Shells and Layouts
impact: CRITICAL
impactDescription: reduces unnecessary client framework surface and keeps Astro's zero-JS default intact
tags: astro-components, layouts, islands
---

## Prefer `.astro` for Static Shells and Layouts

**Impact: CRITICAL (reduces unnecessary client framework surface and keeps Astro's zero-JS default intact)**

state, effect, client runtime가 필요 없는 page shell, route shell, wrapper, content section은 기본적으로 `.astro`로 작성합니다. React component를 이미 쓴다는 이유만으로 정적 shell까지 TSX로 밀어 넣지 말고, interactive leaf만 island로 분리합니다. 이 프로젝트에서 site-wide document shell은 `_document.astro`, `_head.astro`, `_document.css`처럼 `src/pages` 아래의 pages-local helper로 두고, `_document.astro`와 `_head.astro`는 각자 자기 로컬 `Props`로 contract를 직접 소유합니다. route-specific shell은 owning route의 `_local/` 아래에 둡니다. 특별한 재사용 경계가 없으면 body shell을 `_page-chrome.astro`처럼 별도 helper로 나누지 않고 `_document.astro` 안에 유지합니다. 두 종류 모두 shared component tier가 아니며, shared 조각은 `widget`과 `ui`에서 가져와 조립합니다. page content가 주입되는 자리는 `<slot />`로 드러내고, full page shell을 만드는 document shell이라면 `<html>`이 최상위 parent가 되게 유지합니다.

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
