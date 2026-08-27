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
requiresSelected: typescript/naming-use-absolute-paths-beyond-the-folder
reviewWith: ownership-layer-component-boundaries
tags: ownership
---

## Keep Component Imports Flowing Downward

**Impact: CRITICAL (비공개 컴포넌트를 형제나 위쪽에서 되짚어 소유 관계가 무너지지 않습니다)**

컴포넌트 가져오기는 소유 관계를 따라 아래로만 흐릅니다.
소유자, 진입 파일, 하위 소유자가 무엇인지는 `ownership-place-owner-files-in-role-folders`가 정합니다.
같은 폴더에 나란히 있는 소유자끼리를 형제 소유자라고 부릅니다.
경로는 같은 폴더면 `./`, 아니면 `@/`라 모양이 방향을 말하지 않습니다.
그래서 가져올 수 있는지는 가져오는 파일이 어디 있는지로 판정합니다.

| 대상 | 가져올 수 있는 파일 |
| --- | --- |
| `_`로 시작하는 컴포넌트 파일 | 같은 폴더의 파일 |
| 하위 소유자의 진입 파일 | 그 하위 소유자를 담은 소유자 폴더 아래의 파일 |
| 라우트 진입 파일 `page/<route>/pg-<route>` | 라우터 |
| 다른 라우트 안의 파일 | 없음 |
| `ui`·`widget`의 진입 파일 | 어느 파일이든 |
| `_function`·`_type`·`_constant`·`_hook`의 파일 | 레이어 방향과 라우트 경계만 지키면 어느 파일이든 |

- 레이어 방향은 `ui`, `widget`, `page` 순서입니다.
  `ui`는 `widget`과 `page`를, `widget`은 `page`를 가져오지 않습니다.
- 진입 파일이 아닌 컴포넌트 파일은 이름이 `_`로 시작합니다.
  그래서 다른 폴더에서 `_` 컴포넌트 파일을 가져오는 줄은 언제나 위반입니다.
- 형제 소유자의 진입 파일은 가져오지만 형제 안의 `_` 파일은 가져오지 않습니다.
- 타입만 가져오는 것은 이 제약을 받지 않습니다.
  `_` 컴포넌트 파일의 프롭스 타입도 어디서든 `import type`으로 가져옵니다.

여러 자식이 같은 컴포넌트를 써야 하면 셋 중 하나로 해소합니다.

1. 부모가 조립해서 프롭이나 `children`으로 내려보냅니다.
2. 화면 조립을 전제하지 않는 컴포넌트면 `ui` 또는 `widget`으로 올립니다.
3. 짧은 조각이면 그대로 중복해서 씁니다.

세 자식 이상이 같은 것을 써야 하는데 올릴 수도 없으면 자식 분리가 잘못됐다는 신호입니다.
`_function`, `_type`, `_constant`, `_hook`은 렌더 트리를 만들지 않습니다.
그래서 소유자의 공개 면으로 두고 이 방향 제약을 받지 않습니다.
소유자 밖에서 가져다 쓴다고 그 파일을 루트로 옮기지도 않습니다.
자리는 그 값이 누구 것인지로 정하고, 그 판정은 `typescript/naming-place-project-constants-in-the-root-constant-folder`와
`typescript/functions-place-and-promote-support-functions`가 합니다.
함수의 자기 이름 폴더 안 파일만은 그 대표 함수가 가져옵니다.
`_hook`이 예외인 근거는 `ownership-keep-lifecycle-in-the-owning-component`에 있습니다.
여러 소유자가 함께 부르는 생명주기만 훅으로 올리라고 정하는데,
올린 훅을 자식이 가져오지 못하면 그 규칙이 성립하지 않습니다.

**Incorrect (다른 폴더의 `_` 컴포넌트 파일을 가져옴):**

```tsx
// page/detail/sales-trend-panel/_pg-detection-section.tsx
import { PgSectionHeading } from "@/page/detail/_pg-section-heading";
import { PgLegendRow } from "@/page/detail/summary-band/_pg-legend-row";
```

**Incorrect (다른 라우트 안의 컴포넌트를 가져옴):**

```tsx
// page/index/pg-index.tsx
import { PgSalesTrendPanel } from "@/page/detail/sales-trend-panel/pg-sales-trend-panel";
```

**Incorrect (`ui`가 `widget`을 가져옴):**

```tsx
// component/ui/legend/ui-legend.tsx
import { WgLegendPanel } from "@/component/widget/legend-panel/wg-legend-panel";
```

**Correct (진입 파일이 자기 파일과 형제 소유자의 진입 파일을 조립해서 내려보냄):**

```tsx
// page/detail/sales-trend-panel/pg-sales-trend-panel.tsx
import { PgDetectionSection } from "./_pg-detection-section";
import { UiSectionHeading } from "@/component/ui/section-heading/ui-section-heading";
import { PgSummaryBand } from "@/page/detail/summary-band/pg-summary-band";

export const PgSalesTrendPanel = (props: PgSalesTrendPanelProps) => {
	return (
		<section className={clsx("pg_salesTrendPanel__root")}>
			<PgDetectionSection heading={<UiSectionHeading title="매출 추이" />} legendItems={props.legendItems} />
			<PgSummaryBand heading={<UiSectionHeading title="요약" />} />
		</section>
	);
};
```

**Correct (역할 폴더의 파일은 레이어 방향만 지키면 밖에서도 가져옴):**

```ts
// page/detail/sales-trend-panel/_function/to-chart-option.ts
import type { ChartSeries } from "@/component/ui/chart/_type/chart-series";
import { chart_series_line } from "@/component/ui/chart/_constant/series";
```
