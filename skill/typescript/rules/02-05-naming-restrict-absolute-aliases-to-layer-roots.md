---
title: Restrict Absolute Aliases to Layer Roots
titleKo: 절대경로 별칭은 전역 레이어 루트만 가리킵니다
impact: CRITICAL
impactDescription: 소유자 내부 모듈이 밖에서 직접 열리지 않아 경계가 남습니다
appliesWhen:
  - 절대경로 별칭으로 다른 모듈을 가져올 때
  - 별칭이 가리키는 경로 깊이를 바꿀 때
reviewWith: naming-use-direct-imports-and-public-entry-points
tags: naming, imports
---

## Restrict Absolute Aliases to Layer Roots

**Impact: CRITICAL (소유자 내부 모듈이 밖에서 직접 열리지 않아 경계가 남습니다)**

절대경로 별칭의 첫 마디는 전역 레이어 루트여야 합니다.

| 경로 | 판정 |
| --- | --- |
| `@/component`, `@/constant`, `@/config`, `@/util`, `@/type`, `@/hook`, `@/service`, `@/store`, `@/asset` | 허용 |
| `@/page/...` 등 화면 내부 | 금지 |

레이어 루트가 담는 것은 다음과 같습니다.

- `component`는 `component/ui`와 `component/widget` 두 컴포넌트 레이어를 담습니다.
  `ui`와 `widget`의 경계는 프레임워크 컨벤션의 레이어 규칙이 정합니다.
- `constant`는 프로젝트 전반이 쓰는 상수를, `config`는 환경마다 달라지는 값을 담습니다.
- `util`은 프로젝트 전반이 쓰는 함수를 값의 종류 폴더로 묶어 담습니다.
- `type`은 프로젝트 전반이 쓰는 계약을, `hook`은 여러 소유자가 쓰는 훅을 담습니다.
- `service`는 서버 통신 클라이언트를 담습니다.
- `store`는 여러 화면이 함께 읽는 상태를 담습니다.
  상태 관리 라이브러리를 쓰든 컨텍스트를 쓰든 파일명은 `use-<name>-store.ts`입니다.
- `asset`은 아이콘 같은 정적 자원을 담습니다.

루트는 프로젝트가 소유자인 자리라 `constant`·`util`·`type`·`hook`은 소유자 아래 역할 폴더와 같은 규칙을 따릅니다.

- 첫 마디가 레이어 루트면 그 아래 깊이는 제한하지 않습니다.
  `@/component/widget/chart-card/wg-chart-card`는 허용입니다.
- 화면이나 소유자 내부 모듈은 절대경로로 열지 않고 `./`로만 접근합니다.
- 소유자 밖에서 필요해지면 경로를 뚫는 대신 전역 레이어로 올립니다.

**Incorrect (화면 내부 모듈을 절대경로로 가져옴):**

```ts
import {SalesChartCard} from "@/page/detail/component/sales-trend-panel/component/sales-chart-card";
```

**Correct (레이어 루트로 시작하는 별칭과 소유자 안 상대경로):**

```ts
import {WgChartCard} from "@/component/widget/chart-card/wg-chart-card";
import {SalesChartCard} from "./component/sales-chart-card";
```
