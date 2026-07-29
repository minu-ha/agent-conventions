---
title: Use Consistent File and Symbol Naming
impact: HIGH
impactDescription: 에이전트가 파일을 만들거나 옮길 때 소유 경계와 의도를 분명하게 유지함
appliesWhen: >-
  React/TSX 파일·컴포넌트·exported symbol·공용 설정 이름을 정하거나 바꾸거나, React 작업에서 sibling `.ts` support
  파일이나 exported support symbol을 만들거나 옮긴다. local query·mutation만이면 제외한다.
requiresSelected: typescript/naming-use-consistent-file-and-symbol-naming
tags: ownership, naming, files
---

## Use Consistent File and Symbol Naming

**Impact: HIGH (에이전트가 파일을 만들거나 옮길 때 소유 경계와 의도를 분명하게 유지함)**

파일명과 심볼명이 소유자와 역할을 바로 드러내야 route-local 이동과 공용화 판단이 쉬워집니다.

| 대상 | 표기 |
| --- | --- |
| 파일명 | `kebab-case` |
| 일반 변수·함수 | `camelCase` |
| 타입·컴포넌트 | `PascalCase` |
| `shared/config.ts` 의 설정 객체와 키 | `snake_case` |

`const` 여부로 casing을 나누지 않고, 화면과 모듈 안의 로컬 값은 모두 `camelCase`로 맞춥니다.
여러 화면이 함께 쓰는 설정과 enum-like 상수는 `shared/config.ts`의 `config.*` 아래에 둡니다.

- sibling `.ts` support 파일을 만들거나 local 선언을 named export로 옮기면
  이름 자체가 그대로여도 이 규칙을 확인합니다.
- non-exported local symbol은 TypeScript `naming-use-consistent-file-and-symbol-naming`이,
  local query·mutation binding은 `data-name-query-and-mutation-bindings-consistently`가 담당합니다.
  그것만 바꾸면 이 규칙은 적용하지 않습니다.

**Incorrect (파일명과 심볼 규칙이 제각각이고 공용 상수를 화면 파일에 직접 둠):**

```tsx
// UserCard.tsx
const active_tab = "overview";

export const projectMenuKey = {
	dashboard: "dashboard",
	settings: "settings",
} as const;

export const user_card = () => {
	return <section data-tab={active_tab} />;
};
```

**Correct (로컬 값은 `camelCase`, 공용 설정은 `config.*` 체이닝으로 읽음):**

```tsx
// user-card.tsx
import { config } from "@/shared/config";

const activeTab = config.navigation.project_menu_key.dashboard;

export const UserCard = () => {
	return <section data-tab={activeTab} />;
};
```
