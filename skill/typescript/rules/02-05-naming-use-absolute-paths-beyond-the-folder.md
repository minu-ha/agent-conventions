---
title: Use Absolute Paths Beyond the Folder
titleKo: 폴더 밖은 절대경로로, 같은 폴더만 `./`로 가져옵니다
impact: MEDIUM-HIGH
impactDescription: 경로 모양이 하나라 가져오는 줄만 보고 어디의 무엇인지 읽히고, 경계는 위치로 판정합니다
appliesWhen:
  - 다른 폴더의 모듈을 가져올 때
  - `../`로 시작하는 경로를 쓰거나 별칭 경로를 상대경로로 바꾸려 할 때
reviewWith: naming-use-direct-imports-and-public-entry-points
tags: naming, imports
---

## Use Absolute Paths Beyond the Folder

**Impact: MEDIUM-HIGH (경로 모양이 하나라 가져오는 줄만 보고 어디의 무엇인지 읽히고, 경계는 위치로 판정합니다)**

가져오기 경로는 두 모양뿐입니다.

| 대상 | 경로 |
| --- | --- |
| 같은 폴더의 파일 | `./<파일>` |
| 그 밖의 모든 파일 | `@/<src 아래 전체 경로>` |

`../`는 쓰지 않습니다.
같은 폴더 밖이면 한 겹 위든 다른 레이어든 `@/`로 시작합니다.
편집기의 자동 가져오기가 만드는 모양이 그대로 규칙이라 손으로 고칠 일이 없습니다.
같은 폴더를 `./`로 두는 것은 폴더를 옮기거나 이름을 바꿔도 그 안의 가져오기가 그대로 남기 때문입니다.

경로 모양은 경계를 말하지 않습니다.
`@/page/detail/_function/to-summary`는 `page/detail` 안에서 가져오면 정상이고 `page/index`에서 가져오면 위반이지만
문자열은 같습니다.
그래서 무엇을 어디서 가져올 수 있는지는 가져오는 파일의 위치로 판정합니다.
컴포넌트와 소유자 안 파일의 경계는 프레임워크 컨벤션의 가져오기 방향 규칙이 정합니다.

`src` 바로 아래에 있는 레이어 루트는 다음과 같습니다.

- `component`는 `component/ui`와 `component/widget` 두 컴포넌트 레이어를 담습니다.
  `ui`와 `widget`의 경계는 프레임워크 컨벤션의 레이어 규칙이 정합니다.
- `page`는 라우트 폴더를 담습니다.
  라우트 안의 것은 그 라우트 안에서만 가져오고, 라우트 진입 파일은 라우터만 가져옵니다.
- `constant`는 프로젝트 전반이 쓰는 상수를, `config`는 환경마다 달라지는 값을 담습니다.
- `util`은 프로젝트 전반이 쓰는 함수를 값의 종류 폴더로 묶어 담습니다.
- `type`은 프로젝트 전반이 쓰는 계약을, `hook`은 여러 소유자가 쓰는 훅을 담습니다.
- `service`는 서버 통신 클라이언트를 담습니다.
- `store`는 여러 화면이 함께 읽는 상태를 담습니다.
  상태 관리 라이브러리를 쓰든 컨텍스트를 쓰든 파일명은 `use-<name>-store.ts`입니다.
- `asset`은 아이콘 같은 정적 자원을 담습니다.

루트는 프로젝트가 소유자인 자리라 `constant`·`util`·`type`·`hook`은 소유자 아래 역할 폴더와 같은 규칙을 따릅니다.

어디에 두는지는 쓰는 곳으로 정하지 않습니다.
소유자 밖에서 가져다 쓴다고 루트로 올리지 않고, 값이 누구 것인지로 정한 자리에 그대로 둡니다.
그 판정은 `naming-place-project-constants-in-the-root-constant-folder`와
`functions-place-and-promote-support-functions`가 합니다.

**Incorrect (한 겹 위를 `../`로 가져옴):**

```ts
// page/detail/sales-trend-panel/pg-sales-trend-panel.tsx
import {toSummary} from "../_function/to-summary";
import {PgSummaryBand} from "../summary-band/pg-summary-band";
```

**Incorrect (같은 폴더의 파일을 절대경로로 가져옴):**

```ts
// page/detail/sales-trend-panel/pg-sales-trend-panel.tsx
import {PgDetectionSection} from "@/page/detail/sales-trend-panel/_pg-detection-section";
```

**Correct (같은 폴더는 `./`, 그 밖은 `@/`):**

```ts
// page/detail/sales-trend-panel/pg-sales-trend-panel.tsx
import {PgDetectionSection} from "./_pg-detection-section";
import {WgChartCard} from "@/component/widget/chart-card/wg-chart-card";
import {toSummary} from "@/page/detail/_function/to-summary";
import {PgSummaryBand} from "@/page/detail/summary-band/pg-summary-band";
```
