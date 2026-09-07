---
title: Use es-toolkit for Value Helpers
titleKo: 값을 다루는 보조 함수는 `es-toolkit`을 먼저 사용합니다
impact: HIGH
impactDescription: 중복 제거와 표기 변환을 파일마다 다르게 만들지 않고 검증된 구현 하나로 모읍니다
appliesWhen:
  - 배열, 객체, 문자열, 숫자를 다루는 보조 코드를 추가·변경할 때
  - `reduce`, `Object.entries`, `Array.from`, 정규식으로 값을 다시 짜는 코드를 쓸 때
  - 제외: 표준 메서드 하나로 끝나는 경우
reviewWith: values-prefer-immutable-array-sorting, values-handle-dates-with-dayjs
tags: values, es-toolkit
---

## Use es-toolkit for Value Helpers

**Impact: HIGH (중복 제거와 표기 변환을 파일마다 다르게 만들지 않고 검증된 구현 하나로 모읍니다)**

값을 다루는 보조 함수는 `es-toolkit`을 기본으로 쓰고, `lodash`는 새로 들이지 않습니다.
빈 배열·중복 키 같은 경계 처리를 통일하고, 배열을 인자로 펼칠 때의 호출 인자 한계도 피합니다.

| 작업 | 사용할 함수 |
| --- | --- |
| 중복 제거·그룹·색인 | `uniq`, `uniqBy`, `groupBy`, `keyBy` |
| 차집합·교집합·합집합·값 제외·토글 | `difference`, `intersection`, `union`, `without`, `xor` |
| 정렬·분할·조건 분류·반복 범위 | `sortBy`, `orderBy`, `chunk`, `partition`, `range` |
| 객체 복사·깊은 비교 | `clone`, `cloneDeep`, `isEqual` |
| 필드 선택·제외·값 변환 | `pick`, `omit`, `mapValues` |
| 문자열 표기·HTML 이스케이프 | `camelCase`, `snakeCase`, `kebabCase`, `pascalCase`, `capitalize`, `escape` |
| 호출 빈도·횟수·결과 저장 | `debounce`, `throttle`, `once`, `memoize` |
| 집계·범위 제한·최대·최소 | `sum`, `sumBy`, `mean`, `clamp`, `maxBy`, `minBy` |
| 빈 값·타입 검사 | `isNil`, `isNotNil`, `isEmptyObject`, `isPlainObject` |
| 비동기 지연·시간 제한·재시도 | `delay`, `withTimeout`, `retry` |

표에 없어도 문서에 같은 의미의 함수가 있으면 사용합니다.
다만 `map`·`filter`·`find`·`flat`·`at`·`Object.keys`처럼 표준 메서드 하나로 끝나면 그대로 둡니다.
공백 제거는 `value.trim()`, 제거할 문자 지정은 `trim(value, "_")`처럼 구분합니다.

| 교체 전 확인 | 지킬 계약 |
| --- | --- |
| 이름은 같지만 제거 대상이 다름 | `compact`는 falsy를 모두 제거합니다. nullish만 제거하던 공개 계약은 `filter(isNotNil)` 등으로 보존하고 의미 차이를 검증하는 테스트를 남깁니다 |
| 중복 제거 후 남는 항목과 순서 | `Map`은 마지막 항목과 키의 최초 삽입 순서, `uniqBy`는 첫 항목을 남깁니다. 배열을 뒤집어 교체할 때도 남는 항목과 결과 순서가 같은지 확인합니다 |
| 빈 목록의 최소·최대 | `minBy`, `maxBy` 결과의 `undefined`만 검사합니다. 사전 `length` 검사와 값 추출용 중간 `map`은 제거합니다 |
| 표준 메서드로 끝나지 않는 연산 | 직접 여러 줄로 구현하기 전에 `es-toolkit`에서 찾습니다 |

날짜는 `values-handle-dates-with-dayjs`, 정렬은 `values-prefer-immutable-array-sorting`을 따릅니다.
`groupBy`·`keyBy`는 목록 재구성에 쓰고, 반복 조회는
`values-use-set-and-map-for-repeated-lookups`에 따라 `Set`·`Map`으로 처리합니다.

**Incorrect (`es-toolkit`에 있는 함수를 손으로 다시 씁니다):**

```ts
const uniqueOwnerIds = ownerIds.filter((ownerId, index) => ownerIds.indexOf(ownerId) === index);
const uniqueCategories = [...new Set(points.map((point) => point.x))];
const productsByCategory = products.reduce<Record<string, Product[]>>((grouped, product) => {
	grouped[product.category] = [...(grouped[product.category] ?? []), product];
	return grouped;
}, {});
const draftFilter = JSON.parse(JSON.stringify(savedFilter)) as ProductFilter;
const searchKey = rawKey.replace(/([A-Z])/g, "_$1").toLowerCase();
const tickTimes = Array.from({length: tick_count}, (_unused, tickIndex) => toTickTime(tickIndex));
```

**Correct (`es-toolkit` 함수를 그대로 부릅니다):**

```ts
import {cloneDeep, groupBy, range, snakeCase, uniq} from "es-toolkit";

const uniqueOwnerIds = uniq(ownerIds);
const uniqueCategories = uniq(points.map((point) => point.x));
const productsByCategory = groupBy(products, (product) => product.category);
const draftFilter = cloneDeep(savedFilter);
const searchKey = snakeCase(rawKey);
const tickTimes = range(tick_count).map((tickIndex) => toTickTime(tickIndex));
```

**Incorrect (빈 목록을 먼저 검사하고 중간 배열을 만들어 양 끝을 읽습니다):**

```ts
const toChartBounds = (points: readonly ChartPoint[]) => {
	const yValues = points.map((point) => point.y);

	if (yValues.length === 0) {
		return undefined;
	}

	return {min: Math.min(...yValues), max: Math.max(...yValues)};
};
```

**Correct (빈 목록 판정을 `minBy`·`maxBy`의 결과로 합칩니다):**

```ts
import {maxBy, minBy} from "es-toolkit";

const toChartBounds = (points: readonly ChartPoint[]) => {
	const lowestPoint = minBy(points, (point) => point.y);
	const highestPoint = maxBy(points, (point) => point.y);

	if (lowestPoint === undefined || highestPoint === undefined) {
		return undefined;
	}

	return {min: lowestPoint.y, max: highestPoint.y};
};
```

**Correct (표준 메서드 하나로 끝나면 감싸지 않습니다):**

```ts
const activeProducts = products.filter((product) => product.isActive);
const trimmedKeyword = keyword.trim();
```
