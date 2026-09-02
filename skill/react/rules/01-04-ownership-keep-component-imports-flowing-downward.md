---
title: Keep Component Imports Flowing Downward
titleKo: 컴포넌트는 위에서 아래로만 가져옵니다
impact: CRITICAL
impactDescription: 비공개 컴포넌트를 형제나 위쪽에서 되짚어 소유 관계가 무너지지 않습니다
appliesWhen:
  - 소유자 폴더 안의 컴포넌트 파일을 가져올 때
  - 다른 소유자나 다른 라우트의 파일을 가져오려 할 때
  - 여러 자식이 같은 컴포넌트를 써야 해서 배치를 다시 정할 때
  - 제외: 같은 소유자 안에서 `_function`·`_type`·`_constant`·`_hook` 파일을 가져오는 경우
requiresSelected: typescript/naming-import-by-absolute-path
reviewWith: ownership-layer-component-boundaries
tags: ownership
---

## Keep Component Imports Flowing Downward

**Impact: CRITICAL (비공개 컴포넌트를 형제나 위쪽에서 되짚어 소유 관계가 무너지지 않습니다)**

가져오기는 레이어와 소유 관계를 따라 아래로만 흐릅니다.
경로는 전부 `@/`라 모양이 방향을 말하지 않습니다.
그래서 가져올 수 있는지는 가져오는 파일이 어디 있는지로 판정합니다.
소유자, 진입 파일, 하위 소유자, 역할 폴더가 무엇인지는 `ownership-place-owner-files-in-role-folders`가 정합니다.

먼저 레이어 방향입니다.
루트 레이어는 `util`·`constant`·`type`·`hook`·`store`·`service`·`config`·`asset`입니다.

| 가져오는 쪽 | 가져올 수 있는 레이어 |
| --- | --- |
| 루트 레이어 | 루트 레이어 |
| `component/ui` | 루트 레이어 |
| `component/widget` | 루트 레이어, `ui` |
| `page` | 루트 레이어, `ui`, `widget` |
| 라우터와 앱 진입 파일 | 전부 |

그 안에서 소유자 경계입니다.

| 가져오려는 대상 | 가져올 수 있는 파일 |
| --- | --- |
| `ui`·`widget`의 진입 파일 | 레이어 방향을 지키는 파일이면 어느 것이든 |
| 라우트 진입 파일 `page/<route>/pg-<route>` | 라우터 |
| 다른 라우트 안의 파일 | 없음 |
| 하위 소유자의 진입 파일 | 그 하위 소유자를 담은 소유자 폴더 아래의 파일 |
| `_`로 시작하는 파일 | 같은 폴더의 파일 |
| `_function`·`_type`·`_constant`·`_hook`의 파일 | 레이어 방향을 지키는 파일이면 어느 것이든. 다른 라우트의 역할 폴더는 제외합니다 |

- 타입만 가져오는 줄은 `_` 컴포넌트 파일 제약을 받지 않습니다.
  프롭스 타입은 어디서든 `import type`으로 가져옵니다.
- 역할 폴더의 파일은 소유자의 공개 면입니다.
  밖에서 가져다 쓴다고 루트로 옮기지 않습니다.
  자리는 `typescript/naming-place-project-constants-in-the-root-constant-folder`와
  `typescript/functions-promote-shared-functions-to-root-util`이 정합니다.
- `_hook`이 공개인 근거는 `ownership-keep-lifecycle-in-the-owning-component`에 있습니다.
  여러 소유자가 함께 부르는 생명주기만 훅으로 올리라고 정하는데, 올린 훅을 자식이 가져오지 못하면 성립하지 않습니다.

여러 자식이 같은 컴포넌트를 써야 하면 셋 중 하나로 해소합니다.

1. 부모가 조립해서 프롭이나 `children`으로 내려보냅니다.
2. 화면 조립을 전제하지 않는 컴포넌트면 `ui` 또는 `widget`으로 올립니다.
3. 짧은 조각이면 그대로 중복해서 씁니다.

세 자식 이상이 같은 것을 써야 하는데 올릴 수도 없으면 자식 분리가 잘못됐다는 신호입니다.

**Incorrect (다른 폴더의 `_` 컴포넌트 파일을 가져옵니다):**

```tsx
// page/detail/sales-trend-panel/pg-sales-trend-panel.tsx
import {PgSectionHeading} from "@/page/detail/_pg-section-heading";
```

**Correct (`_` 파일과 같은 폴더에 있는 진입 파일이 조립해서 프롭으로 내려보냅니다):**

```tsx
// page/detail/pg-detail.tsx
import {PgSectionHeading} from "@/page/detail/_pg-section-heading";
import {PgSalesTrendPanel} from "@/page/detail/sales-trend-panel/pg-sales-trend-panel";
import {PgSummaryBand} from "@/page/detail/summary-band/pg-summary-band";

export const PgDetail = () => {
	return (
		<main className={clsx("pg_detail__root")}>
			<PgSalesTrendPanel heading={<PgSectionHeading title="매출 추이" />} />
			<PgSummaryBand heading={<PgSectionHeading title="요약" />} />
		</main>
	);
};
```

**Incorrect (다른 라우트 안의 컴포넌트를 가져옵니다):**

```tsx
// page/index/pg-index.tsx
import {PgSalesTrendPanel} from "@/page/detail/sales-trend-panel/pg-sales-trend-panel";
```

**Correct (두 라우트가 같이 쓰면 화면을 모르는 자리로 올려 각자 가져옵니다):**

```tsx
// component/widget/sales-trend-panel/wg-sales-trend-panel.tsx
export const WgSalesTrendPanel = (props: WgSalesTrendPanelProps) => {
	return <section className={clsx("wg_salesTrendPanel__root")}>{props.children}</section>;
};

// page/index/pg-index.tsx
import {WgSalesTrendPanel} from "@/component/widget/sales-trend-panel/wg-sales-trend-panel";
```

**Incorrect (`ui`가 `widget`을 가져옵니다):**

```tsx
// component/ui/legend/ui-legend.tsx
import {WgLegendPanel} from "@/component/widget/legend-panel/wg-legend-panel";
```

**Correct (방향을 뒤집어 `widget`이 `ui`를 가져옵니다):**

```tsx
// component/widget/legend-panel/wg-legend-panel.tsx
import {UiLegend} from "@/component/ui/legend/ui-legend";
```

**Incorrect (밖에서 가져다 쓴다고 역할 폴더 파일을 루트로 올립니다):**

```ts
// type/chart-series.ts
// component/ui/chart/_type 에 있던 것을 page 에서도 쓴다고 루트로 옮겼다
export interface ChartSeries {
	/**
	 * 선 하나가 그리는 좌표
	 */
	points: ChartPoint[];
}

// page/detail/sales-trend-panel/_function/to-chart-option.ts
import type {ChartSeries} from "@/type/chart-series";
```

**Correct (역할 폴더의 파일은 레이어 방향만 지키면 밖에서도 가져옵니다):**

```ts
// page/detail/sales-trend-panel/_function/to-chart-option.ts
import type {ChartSeries} from "@/component/ui/chart/_type/chart-series";
import {chart_series_line} from "@/component/ui/chart/_constant/series";
```
