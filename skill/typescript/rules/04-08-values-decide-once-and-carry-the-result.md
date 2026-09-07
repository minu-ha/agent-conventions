---
title: Decide Once and Carry the Result
titleKo: 판정은 한 번만 하고 결과를 데이터로 전달합니다
impact: MEDIUM
impactDescription: 같은 판정을 반복하지 않고 소비처가 전달된 결과를 사용합니다
appliesWhen:
  - 같은 입력에 같은 판정·정규화·포맷을 두 자리 이상에서 할 때
  - 포맷하거나 정리한 값을 소비처에서 다시 파싱하거나 정리할 때
  - 두 함수가 같은 판정 함수를 부르게 되어 공유 보조를 만들려 할 때
reviewWith: functions-extract-helpers-only-when-the-boundary-is-real, absence-resolve-defaults-at-the-boundary
tags: values, boundaries
---

## Decide Once and Carry the Result

**Impact: MEDIUM (같은 판정을 반복하지 않고 소비처가 전달된 결과를 사용합니다)**

값이 들어오는 경계에서 한 번 판정하고, 결과를 데이터 필드로 전달합니다.
소비처는 같은 판정 함수를 다시 호출하거나 공유 보조 함수로 추출하지 않고 그 필드를 읽습니다.

| 반복되는 처리 | 변경 |
| --- | --- |
| 포맷한 문자열을 소비처가 다시 파싱·포맷 | 경계에서 한 번 포맷하고 그대로 사용합니다 |
| 정리한 값을 소비처가 다시 `trim` | 경계에서 한 번 정리합니다 |
| 두 함수가 같은 판정 함수를 호출 | 항목에 판정 결과를 담고 두 함수가 읽습니다 |
| 전달된 결과 옆에 `?? 다시 판정` 폴백 | 폴백을 제거합니다 |

결과를 담을 필드가 없으면 소유자가 만드는 내부 항목 형태에 추가합니다.
외부 응답·생성된 DTO·공개 요청 계약을 바꾸거나 공유 캐시 원본을 직접 수정하지 않습니다.
시각·권한·로케일 등 판정 입력이 바뀌면 다시 계산하고, 입력이나 소비 목적이 다르면 판정을 합치지 않습니다.
경계의 선택 순서는 `absence-resolve-defaults-at-the-boundary`와 같습니다.

**Incorrect (경계에서 포맷한 값을 소비처가 다시 파싱해 포맷합니다):**

```ts
// page/pattern/pg-pattern.tsx: SelectionInfo 를 만들며 이미 포맷한다
const selectionInfo = {avgCorr: formatStatDecimal(responseSelectionInfoSuspense.data.statCorr)};

// page/pattern/_function/to-metrics-content.ts: 문자열을 다시 숫자로 읽어 다시 포맷한다
const rows = [{id: "statCorr", value: formatStatDecimal(selectionInfo.avgCorr)}];
```

**Correct (경계에서 한 번 포맷하고 소비처는 전달된 값을 그대로 씁니다):**

```ts
// page/pattern/_function/to-metrics-content.ts
const rows = [{id: "statCorr", value: selectionInfo.avgCorr}];
```

**Incorrect (같은 색 판정을 범례와 차트 둘에서 하고 폴백으로 한 번 더 합니다):**

```ts
// 범례
const colorToken = toCurveColorToken(curveItem.role, historicalIndex);

// 차트 둘. 범례 팔레트를 읽고도 같은 판정을 다시 한다
colorToken: colorTokenById.get(curveItem.id) ?? toCurveColorToken(curveItem.role, index),
```

**Correct (경계에서 한 번 정해 항목에 담고 차트는 읽기만 합니다):**

```ts
// 범례를 만드는 자리에서 색을 정해 항목에 싣는다
const comparisonCurves = curveItems.map((curveItem, historicalIndex) => ({
	...curveItem,
	colorToken: toCurveColorToken(curveItem.role, historicalIndex),
}));

// 차트 둘은 같은 항목의 색을 그대로 읽는다
const chartSeries = comparisonCurves.map((curve) => ({
	id: curve.id,
	colorToken: curve.colorToken,
}));
```
