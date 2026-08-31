---
title: Import by Absolute Path
titleKo: 가져오기 경로는 `@/`로 씁니다
impact: MEDIUM-HIGH
impactDescription: 경로 모양이 하나라 가져오는 줄만 보고 어디의 무엇인지 읽히고, 경계는 위치로 판정합니다
appliesWhen:
  - 다른 모듈을 가져오는 경로를 쓸 때
  - `./`나 `../`로 시작하는 경로를 쓰거나 별칭 경로를 상대경로로 바꾸려 할 때
reviewWith: naming-use-direct-imports-and-public-entry-points
tags: naming, imports
---

## Import by Absolute Path

**Impact: MEDIUM-HIGH (경로 모양이 하나라 가져오는 줄만 보고 어디의 무엇인지 읽히고, 경계는 위치로 판정합니다)**

| 가져오는 줄 | 경로 | 이유 |
| --- | --- | --- |
| 심볼을 가져오는 줄 `import {a} from …` | `@/<src 아래 경로>` | 편집기 자동 가져오기가 만드는 모양입니다 |
| 심볼 없이 파일만 불러오는 줄 `import "….css"` | 같은 폴더면 `./<파일>`, 아니면 `@/<src 아래 경로>` | 자동 가져오기가 없어 손으로 적는 줄입니다 |

- `../`는 어느 줄에도 쓰지 않습니다.
- 폴더를 옮기거나 이름을 바꾸면 편집기의 이름 바꾸기가 경로를 따라 고칩니다.
- 경로 모양은 경계를 말하지 않습니다.
  `@/page/detail/_function/to-summary`는 `page/detail` 안에서는 정상이고 `page/index`에서는 위반이지만 문자열은
  같습니다.
  무엇을 어디서 가져올 수 있는지는 가져오는 파일의 위치로 판정합니다.
  그 표는 프레임워크 컨벤션의 가져오기 방향 규칙에 있습니다.
- 어디에 두는지는 쓰는 곳으로 정하지 않습니다.
  소유자 밖에서 가져다 쓴다고 루트로 올리지 않습니다.
  자리는 `naming-place-project-constants-in-the-root-constant-folder`와
  `functions-give-each-function-its-own-file`가 정합니다.

`src` 바로 아래에 있는 레이어 루트입니다.

| 루트 | 담는 것 |
| --- | --- |
| `component` | `component/ui`와 `component/widget` 두 컴포넌트 레이어 |
| `page` | 라우트 폴더. 라우트 안의 것은 그 라우트 안에서만 가져오고, 라우트 진입 파일은 라우터만 가져옵니다 |
| `constant` | 프로젝트 전반이 쓰는 상수 |
| `config` | 환경마다 달라지는 값 |
| `util` | 프로젝트 전반이 쓰는 함수. 값의 종류 폴더로 묶습니다 |
| `type` | 프로젝트 전반이 쓰는 계약 |
| `hook` | 여러 소유자가 쓰는 훅 |
| `store` | 여러 화면이 함께 읽는 상태. 파일명은 `use-<name>-store.ts`입니다 |
| `service` | 서버 통신 클라이언트 |
| `asset` | 아이콘 같은 정적 자원 |

루트는 프로젝트가 소유자인 자리라 `constant`·`util`·`type`·`hook`은 소유자 아래 역할 폴더와 같은 규칙을 따릅니다.

**Incorrect (상대경로로 심볼을 가져옴):**

```ts
// page/detail/sales-trend-panel/pg-sales-trend-panel.tsx
import {PgDetectionSection} from "./_pg-detection-section";
import {toSummary} from "../_function/to-summary";
```

**Correct (심볼은 `@/`, 같은 폴더의 CSS 파일만 `./`):**

```ts
// page/detail/sales-trend-panel/pg-sales-trend-panel.tsx
import {WgChartCard} from "@/component/widget/chart-card/wg-chart-card";
import {toSummary} from "@/page/detail/_function/to-summary";
import {PgDetectionSection} from "@/page/detail/sales-trend-panel/_pg-detection-section";
import {PgSummaryBand} from "@/page/detail/summary-band/pg-summary-band";

import "./pg-sales-trend-panel.css";
```
