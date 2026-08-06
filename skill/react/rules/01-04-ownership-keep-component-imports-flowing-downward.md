---
title: Keep Component Imports Flowing Downward
titleKo: 컴포넌트는 위에서 아래로만 가져옵니다
impact: CRITICAL
impactDescription: 비공개 컴포넌트를 형제나 위쪽에서 되짚어 소유 관계가 무너지지 않습니다
appliesWhen:
  - `component` 폴더 안의 파일을 다른 파일에서 가져올 때
  - `../`나 `@/page` 경로로 컴포넌트를 가져오려 할 때
  - 여러 자식이 같은 컴포넌트를 써야 해서 배치를 다시 정할 때
  - 제외: `function`·`type`·`config` 파일을 가져오는 경우
requiresSelected: typescript/naming-restrict-absolute-aliases-to-layer-roots
reviewWith: ownership-layer-component-boundaries
tags: ownership
---

## Keep Component Imports Flowing Downward

**Impact: CRITICAL (비공개 컴포넌트를 형제나 위쪽에서 되짚어 소유 관계가 무너지지 않습니다)**

컴포넌트 가져오기는 소유 관계를 따라 아래로만 흐릅니다.

- `component` 폴더 안의 파일은 그 폴더의 소유자만 가져옵니다.
- 형제끼리는 가져오지 않습니다.
- `../`로 컴포넌트를 가져오지 않습니다.
- 절대경로 별칭의 허용 범위는 `typescript/naming-restrict-absolute-aliases-to-layer-roots`가 정합니다.

여러 자식이 같은 컴포넌트를 써야 하면 셋 중 하나로 해소합니다.

1. 부모가 조립해서 프롭이나 `children`으로 내려보냅니다.
2. 화면 조립을 전제하지 않는 컴포넌트면 `ui` 또는 `widget`으로 올립니다.
3. 짧은 조각이면 그대로 중복해서 씁니다.

세 자식 이상이 같은 것을 써야 하는데 올릴 수도 없으면 자식 분리가 잘못됐다는 신호입니다.
`function`, `type`, `config`는 렌더 트리를 만들지 않으므로 소유자 안에서 공유하고 이 방향 제약을 받지 않습니다.

**Incorrect (형제 컴포넌트를 직접 가져와 소유 관계가 사라짐):**

```tsx
// page/detail/component/sales-trend-panel/component/pg-detection-section.tsx
import { PgLegendRow } from "./pg-legend-row";
import { SectionHeading } from "../../section-heading/section-heading";
```

**Incorrect (절대경로로 다른 화면 내부를 가져옴):**

```tsx
import { PgSalesChartCard } from "@/page/detail/component/sales-trend-panel/component/pg-sales-chart-card";
```

**Correct (부모가 조립해서 내려보냄):**

```tsx
// page/detail/component/sales-trend-panel/pg-sales-trend-panel.tsx
import { UiSectionHeading } from "@/ui/section-heading/ui-section-heading";

import { PgDetectionSection } from "./component/pg-detection-section";
import { PgSummaryBand } from "./component/pg-summary-band";

export const PgSalesTrendPanel = (props: PgSalesTrendPanelProps) => {
	return (
		<section className={clsx("pg_salesTrendPanel__root")}>
			<PgDetectionSection heading={<UiSectionHeading title="매출 추이" />} legendItems={props.legendItems} />
			<PgSummaryBand heading={<UiSectionHeading title="요약" />} />
		</section>
	);
};
```

**Correct (맥락 독립 컴포넌트는 전역 레이어에서 가져옴):**

```tsx
// page/detail/component/sales-trend-panel/component/pg-detection-section.tsx
import { WgLegendPanel } from "@/widget/legend-panel/wg-legend-panel";
```
