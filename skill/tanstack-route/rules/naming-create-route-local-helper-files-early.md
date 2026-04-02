---
title: Create Route-local `*.ts` Helper Files Early
impact: MEDIUM-HIGH
impactDescription: keeps route files from accumulating normalization and mapping logic before boundaries blur
tags: helpers, route-local, typescript
---

## Create Route-local `*.ts` Helper Files Early

**Impact: MEDIUM-HIGH (keeps route files from accumulating normalization and mapping logic before boundaries blur)**

라우트 전용 유틸, 헬퍼, 변환 함수는 가능하면 시작 시점부터 같은 계층 `*.ts` 파일에 모읍니다. 화면이 커진 뒤 나중에 억지로 분리하는 대신, 초기에 helper 자리를 확보해 route entry가 화면 흐름에 집중하게 만듭니다.

**Incorrect (helper를 route 파일 안에 계속 누적):**

```ts
// settings.index.tsx
const normalizeSettingsSearch = (value: string | undefined) => {
	return value?.trim().toLowerCase() ?? "";
};

const buildSettingsRedirect = (tab: string) => {
	return {to: "/app/settings/general", search: {tab}};
};
```

**Correct (같은 계층 helper 파일에 순수 로직을 분리):**

```txt
(settings)/
  settings.css
  settings.ts
  settings.layout.tsx
  settings.index.tsx
```

```ts
// settings.ts
export const normalizeSettingsSearch = (value: string | undefined) => {
	return value?.trim().toLowerCase() ?? "";
};

export const buildSettingsRedirect = (tab: string) => {
	return {to: "/app/settings/general", search: {tab}};
};
```
