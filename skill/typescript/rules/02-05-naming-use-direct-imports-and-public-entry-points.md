---
title: Use Direct Imports and Dedicated Public Entry Points
titleKo: `index.ts` 배럴을 만들지 않고 필요한 파일에서 바로 가져옵니다
impact: MEDIUM-HIGH
impactDescription: 배럴이나 모호한 재노출 계층에 기대지 않고 무엇을 어디서 가져오는지 드러냅니다
appliesWhen:
  - 가져오기, 내보내기, `index.ts` 배럴, 공용 진입점, 소유자 보조 모듈의 경계를 추가·변경할 때
  - 같은 경로에서 값과 타입 중 무엇을 가져올지 추가·삭제·전환할 때
reviewWith: naming-restrict-absolute-aliases-to-layer-roots
tags: naming
---

## Use Direct Imports and Dedicated Public Entry Points

**Impact: MEDIUM-HIGH (배럴이나 모호한 재노출 계층에 기대지 않고 무엇을 어디서 가져오는지 드러냅니다)**

`index.ts`로 묶어 다시 내보내는 배럴을 만들지 않습니다.
필요한 파일에서 바로 가져옵니다.
역할 폴더를 `index.ts`로 묶는 것도 배럴이라 만들지 않습니다.
같은 파일이 소유한 `export const Dialog = { Root, Header } as const` 같은 조립 객체는
다시 내보내는 계층이 아니므로 배럴이 아닙니다.
타입만 가져올 때는 `import type`을 써서 계약과 실행 의존을 나눕니다.

절대경로 별칭으로 어디까지 열지는 `naming-restrict-absolute-aliases-to-layer-roots` 규칙이 정합니다.

경로가 같아도 값과 타입 중 무엇을 가져오는지가 바뀌면
가져오기 계약이 바뀐 것이라 이 규칙을 적용합니다.

**Incorrect (배럴과 섞인 가져오기로 경계를 흐림):**

```ts
import {config, util, UserProfile} from "./index";
```

**Correct (직접 가져오기와 공개 진입점을 구분):**

```ts
import type {UserProfile} from "@/shared/contracts";
import {config} from "@/shared/config";
import {util} from "@/shared/util";
import {WgChartCard} from "@/widget/chart-card/wg-chart-card";
import {toUserSaveRequest} from "./function/to-user-save-request";
```
