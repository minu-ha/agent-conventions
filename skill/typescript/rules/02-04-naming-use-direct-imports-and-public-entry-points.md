---
title: Use Direct Imports and Dedicated Public Entry Points
titleKo: `index.ts` 배럴을 만들지 않고 필요한 파일에서 바로 가져옵니다
impact: MEDIUM-HIGH
impactDescription: 배럴이나 재노출 계층 없이 선언의 출처를 직접 확인할 수 있습니다
appliesWhen:
  - 가져오기, 내보내기, `index.ts` 배럴, 공개 진입점, 소유자 보조 모듈의 경계를 추가·변경할 때
  - 같은 경로에서 값과 타입 중 무엇을 가져올지 추가·삭제·전환할 때
reviewWith: naming-import-by-absolute-path
tags: naming
---

## Use Direct Imports and Dedicated Public Entry Points

**Impact: MEDIUM-HIGH (배럴이나 재노출 계층 없이 선언의 출처를 직접 확인할 수 있습니다)**

필요한 파일에서 직접 가져오고 선언 앞에 `export`를 붙여 이름으로 내보냅니다.
`index.ts` 배럴이나 파일 끝의 `export {…}` 목록은 만들지 않습니다.

| 형태 | 판정 |
| --- | --- |
| 역할 폴더나 여러 파일을 `index.ts`로 재노출 | 배럴이므로 만들지 않습니다 |
| 같은 파일이 소유한 `export const Dialog = { Root, Header } as const` | 재노출 계층이 아닌 조립 객체이므로 허용합니다 |
| `default` 내보내기 | `vite.config.ts`처럼 도구가 요구하는 계약에만 씁니다 |
| 타입만 가져오기 | `import type`으로 실행 의존과 구분합니다 |

`default`는 사용처마다 이름이 달라지고 원본의 이름 변경도 반영되지 않습니다.
경로 형식은 `naming-import-by-absolute-path`를 따릅니다.
같은 경로라도 값·타입 가져오기를 바꾸면 이 규칙을 적용합니다.

**Incorrect (배럴과 섞인 가져오기로 경계를 흐립니다):**

```ts
import {pagination_default_page_size, toDisplayDate, UserProfile} from "./index";
```

**Correct (필요한 파일에서 이름으로 바로 가져옵니다):**

```ts
import type {UserProfile} from "@/type/user-profile";
import {pagination_default_page_size} from "@/constant/pagination";
import {toDisplayDate} from "@/util/date/to-display-date";
```

**Incorrect (`default`로 내보내 사용처마다 다른 이름이 생깁니다):**

```tsx
// component/ui/tabs/ui-tabs.tsx
const UiTabs = (props: UiTabsProps) => {
	return <div role="tablist">{props.children}</div>;
};

export default UiTabs;

// page/settings/pg-settings.tsx
// 사용처가 이름을 지어서 같은 컴포넌트가 파일마다 다른 이름으로 불린다
import Tabs from "@/component/ui/tabs/ui-tabs";
```

**Correct (선언 앞에 `export`를 붙여 사용처가 그 이름으로 가져옵니다):**

```tsx
// component/ui/tabs/ui-tabs.tsx
export const UiTabs = (props: UiTabsProps) => {
	return <div role="tablist">{props.children}</div>;
};

// page/settings/pg-settings.tsx
import {UiTabs} from "@/component/ui/tabs/ui-tabs";
```
