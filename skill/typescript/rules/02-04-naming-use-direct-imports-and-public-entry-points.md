---
title: Use Direct Imports and Dedicated Public Entry Points
titleKo: `index.ts` 배럴을 만들지 않고 필요한 파일에서 바로 가져옵니다
impact: MEDIUM-HIGH
impactDescription: 배럴이나 모호한 재노출 계층에 기대지 않고 무엇을 어디서 가져오는지 드러냅니다
appliesWhen:
  - 가져오기, 내보내기, `index.ts` 배럴, 공개 진입점, 소유자 보조 모듈의 경계를 추가·변경할 때
  - 같은 경로에서 값과 타입 중 무엇을 가져올지 추가·삭제·전환할 때
reviewWith: naming-import-by-absolute-path
tags: naming
---

## Use Direct Imports and Dedicated Public Entry Points

**Impact: MEDIUM-HIGH (배럴이나 모호한 재노출 계층에 기대지 않고 무엇을 어디서 가져오는지 드러냅니다)**

`index.ts`로 묶어 다시 내보내는 배럴을 만들지 않고, 필요한 파일에서 바로 가져옵니다.
내보내기는 선언 앞에 `export`를 붙인 이름 붙인 내보내기만 씁니다.
파일 끝에 `export {…}` 목록을 따로 두지 않습니다.

| 형태 | 판정 |
| --- | --- |
| `index.ts`로 묶어 다시 내보내는 배럴 | 만들지 않습니다 |
| 역할 폴더를 `index.ts`로 묶는 것 | 배럴이라 만들지 않습니다 |
| 같은 파일이 소유한 `export const Dialog = { Root, Header } as const` 같은 조립 객체 | 다시 내보내는 계층이 아니므로 배럴이 아닙니다 |
| `default` 내보내기 | 도구가 그 파일의 계약으로 요구할 때만 씁니다. `vite.config.ts` 같은 설정 진입점이 그 자리입니다 |
| 타입만 가져오기 | `import type`을 써서 계약과 실행 의존을 나눕니다 |

`default`는 이름을 사용처가 짓습니다.
같은 것이 파일마다 다른 이름으로 불리고, 이름 바꾸기도 사용처까지 번지지 않습니다.

경로 모양은 `naming-import-by-absolute-path` 규칙이 정합니다.
경로가 같아도 값과 타입 중 무엇을 가져오는지가 바뀌면 가져오기 계약이 바뀐 것이라 이 규칙을 적용합니다.

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
