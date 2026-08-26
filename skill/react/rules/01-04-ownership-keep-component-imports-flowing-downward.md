---
title: Keep Component Imports Flowing Downward
titleKo: 컴포넌트는 위에서 아래로만 가져옵니다
impact: CRITICAL
impactDescription: 비공개 컴포넌트를 형제나 위쪽에서 되짚어 소유 관계가 무너지지 않습니다
appliesWhen:
  - 소유자 폴더 안의 컴포넌트 파일을 가져올 때
  - `../`나 `@/page` 경로로 컴포넌트를 가져오려 할 때
  - 여러 자식이 같은 컴포넌트를 써야 해서 배치를 다시 정할 때
  - 제외: `_function`·`_type`·`_constant`·`_hook` 파일을 가져오는 경우
requiresSelected: typescript/naming-restrict-absolute-aliases-to-layer-roots
reviewWith: ownership-layer-component-boundaries
tags: ownership
---

## Keep Component Imports Flowing Downward

**Impact: CRITICAL (비공개 컴포넌트를 형제나 위쪽에서 되짚어 소유 관계가 무너지지 않습니다)**

컴포넌트 가져오기는 소유 관계를 따라 아래로만 흐릅니다.
소유자, 진입 파일, 하위 소유자가 무엇인지는 `ownership-place-owner-files-in-role-folders`가 정합니다.
같은 폴더에 나란히 있는 소유자끼리를 형제 소유자라고 부릅니다.

- 소유자 안의 컴포넌트를 가져오는 것은 진입 파일뿐입니다.
- 진입 파일은 자기 폴더의 컴포넌트 파일과 하위 소유자의 진입 파일을 `./`로 가져옵니다.
- 진입 파일은 형제 소유자의 진입 파일을 `../<소유자>/<진입 파일>`로 가져옵니다.
  `../`는 한 번만 쓰고 형제 소유자의 진입 파일에만 닿습니다.
  `../<파일>`과 `../../`는 쓰지 않습니다.
- 진입 파일이 아닌 컴포넌트 파일은 소유자 안의 컴포넌트를 가져오지 않습니다.
  자기만 쓰는 파일이 생기면 그 컴포넌트는 폴더를 갖고 진입 파일이 됩니다.
- 진입 파일이 아닌 컴포넌트 파일은 이름이 `_`로 시작합니다.
  그래서 `../`나 절대경로 뒤에 `_` 파일이 오면 이 규칙 위반입니다.
- `ui`와 `widget` 레이어의 컴포넌트는 어느 파일에서든 가져옵니다.
  절대경로 별칭의 허용 범위는 `typescript/naming-restrict-absolute-aliases-to-layer-roots`가 정합니다.

여러 자식이 같은 컴포넌트를 써야 하면 셋 중 하나로 해소합니다.

1. 부모가 조립해서 프롭이나 `children`으로 내려보냅니다.
2. 화면 조립을 전제하지 않는 컴포넌트면 `ui` 또는 `widget`으로 올립니다.
3. 짧은 조각이면 그대로 중복해서 씁니다.

세 자식 이상이 같은 것을 써야 하는데 올릴 수도 없으면 자식 분리가 잘못됐다는 신호입니다.
`_function`, `_type`, `_constant`, `_hook`은 렌더 트리를 만들지 않습니다.
그래서 소유자 안에서 공유하고 이 방향 제약을 받지 않습니다.
`_hook`이 예외인 근거는 `ownership-keep-lifecycle-in-the-owning-component`에 있습니다.
여러 소유자가 함께 부르는 생명주기만 훅으로 올리라고 정하는데,
올린 훅을 자식이 가져오지 못하면 그 규칙이 성립하지 않습니다.

**Incorrect (진입 파일이 아닌 파일이 형제와 부모 폴더의 파일을 가져와 소유 관계가 사라짐):**

```tsx
// page/detail/sales-trend-panel/_pg-detection-section.tsx
import { PgLegendRow } from "./_pg-legend-row";
import { PgSectionHeading } from "../_pg-section-heading";
```

**Incorrect (진입 파일이 아닌 파일이 형제 소유자의 진입 파일을 가져옴):**

```tsx
// page/detail/sales-trend-panel/_pg-detection-section.tsx
import { PgSummaryBand } from "../summary-band/pg-summary-band";
```

**Incorrect (절대경로로 다른 화면 내부를 가져옴):**

```tsx
import { PgSalesChartCard } from "@/page/detail/sales-trend-panel/_pg-sales-chart-card";
```

**Correct (진입 파일이 자기 파일과 형제 소유자의 진입 파일을 조립해서 내려보냄):**

```tsx
// page/detail/sales-trend-panel/pg-sales-trend-panel.tsx
import { UiSectionHeading } from "@/component/ui/section-heading/ui-section-heading";

import { PgSummaryBand } from "../summary-band/pg-summary-band";
import { PgDetectionSection } from "./_pg-detection-section";

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
// page/detail/sales-trend-panel/_pg-detection-section.tsx
import { WgLegendPanel } from "@/component/widget/legend-panel/wg-legend-panel";
```
