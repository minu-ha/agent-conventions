---
title: Use Owner-named Route Support Modules Instead of Generic Helper Files
titleKo: route support 모듈의 owner 이름 사용
impact: MEDIUM-HIGH
impactDescription: 경계가 흐려지기 전에 route 파일에 정규화·매핑 로직이 쌓이는 것을 막습니다
tags: helpers, route-local, typescript
---

## Use Owner-named Route Support Modules Instead of Generic Helper Files

**Impact: MEDIUM-HIGH (경계가 흐려지기 전에 route 파일에 정규화·매핑 로직이 쌓이는 것을 막습니다)**

라우트 전용 순수 support code가 entry file을 흐리기 시작하면 첫 추출 대상은 같은 계층 owner-named module입니다.
예를 들어 `settings.index.tsx`라면 `settings.ts`로 옮기고 named export를 직접 import합니다.

exported support helper는 `convention-typescript` 규칙에 맞춰 `@helper` JSDoc을 붙이고,
silent fallback으로 결측을 숨기지 않습니다.
`helper.ts`, `helpers.ts`, `utils.ts`, `common.ts` 같은 generic 파일명은 만들지 않고,
화면 하나에서만 쓰는 custom hook으로 우회해 숨기지도 않습니다.

**Incorrect (generic helper 파일명으로 support code를 분산):**

```txt
(settings)/
  helpers.ts
  settings.index.tsx
```

```ts
// helpers.ts
export const normalizeSettingsSearch = (value: string | undefined) => {
	return value?.trim().toLowerCase() ?? "";
};
```

**Correct (owner-named sibling module에 named export로 유지):**

```ts
// settings.ts
/**
 * @helper settings 검색어 trim/lower 정규화
 */
export const normalizeSettingsSearch = (value: string | undefined) => {
	const normalizedValue = value?.trim().toLowerCase();

	if (!normalizedValue) {
		return undefined;
	}

	return normalizedValue;
};

/**
 * @helper settings 기본 redirect destination 조립
 */
export const buildSettingsRedirect = (tab: string) => {
	return {to: "/app/settings/general", search: {tab}};
};
```
