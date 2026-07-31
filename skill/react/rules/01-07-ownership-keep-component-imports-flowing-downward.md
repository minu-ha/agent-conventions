---
title: Keep Component Imports Flowing Downward
titleKo: 컴포넌트 import의 하향 단방향 유지
impact: CRITICAL
impactDescription: private component가 형제나 상위에서 역참조되어 소유 관계가 무너지는 것을 막습니다
appliesWhen:
  - `component` 폴더 안의 파일을 다른 파일에서 import할 때
  - `../`나 `@/page` 경로로 component를 가져오려 할 때
  - 여러 자식이 같은 component를 필요로 해 배치를 다시 정할 때
requiresSelected: typescript/naming-use-direct-imports-and-public-entry-points
reviewWith: ownership-layer-component-boundaries
tags: ownership, imports, direction, private
---

## Keep Component Imports Flowing Downward

**Impact: CRITICAL (private component가 형제나 상위에서 역참조되어 소유 관계가 무너지는 것을 막습니다)**

component import는 소유 관계를 따라 아래로만 흐릅니다.

- `component` 폴더 안의 파일은 그 폴더의 owner만 import합니다.
- 형제끼리는 import하지 않습니다.
- `../`로 component를 가져오지 않습니다.
- 절대경로는 전역 레이어 루트만 가리킵니다. `@/page/...`로 화면 내부를 가져오지 않습니다.

여러 자식이 같은 component를 필요로 하면 셋 중 하나로 해소합니다.

1. 부모가 조립해서 prop이나 `children`으로 내려보냅니다.
2. 화면 조립을 전제하지 않는 component면 `ui` 또는 `widget`으로 올립니다.
3. 짧은 조각이면 그대로 중복해서 씁니다.

세 자식 이상이 같은 것을 필요로 하는데 올릴 수도 없으면 자식 분리가 잘못됐다는 신호입니다.
`function`, `type`, `config`는 렌더 트리를 만들지 않으므로 owner 안에서 공유하고 이 방향 제약을 받지 않습니다.

**Incorrect (형제 component를 직접 가져와 소유 관계가 사라짐):**

```tsx
// page/detail/component/spike-pattern-panel/component/detection-section.tsx
import { LegendRow } from "./legend-row";
import { SectionHeading } from "../../section-heading/section-heading";
```

**Incorrect (절대경로로 다른 화면 내부를 가져옴):**

```tsx
import { SpikeChartCard } from "@/page/detail/component/spike-pattern-panel/component/spike-chart-card";
```

**Correct (부모가 조립해서 내려보냄):**

```tsx
// page/detail/component/spike-pattern-panel/spike-pattern-panel.tsx
import { UiSectionHeading } from "@/ui/section-heading/ui-section-heading";

import { DetectionSection } from "./component/detection-section";
import { SummaryBand } from "./component/summary-band";

export const SpikePatternPanel = (props: SpikePatternPanelProps) => {
	const { legendItems } = props;

	return (
		<section className="pv_spikePatternPanel__root">
			<DetectionSection heading={<UiSectionHeading title="상단 이탈 감지" />} legendItems={legendItems} />
			<SummaryBand heading={<UiSectionHeading title="요약" />} />
		</section>
	);
};
```

**Correct (맥락 독립 component는 전역 레이어에서 가져옴):**

```tsx
// page/detail/component/spike-pattern-panel/component/detection-section.tsx
import { WgLegendPanel } from "@/widget/legend-panel/wg-legend-panel";
```
