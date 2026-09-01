---
title: Use es-toolkit for Value Helpers
titleKo: 값을 다루는 보조는 직접 만들지 않고 `es-toolkit`을 씁니다
impact: MEDIUM-HIGH
impactDescription: 중복 제거와 표기 변환을 파일마다 다르게 만들지 않고 검증된 구현 하나로 모읍니다
appliesWhen:
  - 배열, 객체, 문자열, 숫자를 다루는 보조 코드를 추가·변경할 때
  - `reduce`, `Object.entries`, `Array.from`, 정규식으로 값을 다시 짜는 코드를 쓸 때
  - 제외: 표준 메서드 하나로 끝나는 경우
reviewWith: values-prefer-immutable-array-sorting, values-handle-dates-with-dayjs
tags: values, es-toolkit
---

## Use es-toolkit for Value Helpers

**Impact: MEDIUM-HIGH (중복 제거와 표기 변환을 파일마다 다르게 만들지 않고 검증된 구현 하나로 모읍니다)**

값을 다루는 보조 함수는 `es-toolkit`에서 먼저 찾습니다.
`clsx`와 같은 자리입니다.
쓸지 말지 고르는 라이브러리가 아니라 기본값입니다.

직접 쓴 구현은 빈 배열, 중복 키, 한 글자 문자열 같은 경계에서 저마다 다르게 틀립니다.
`Math.min(...values)`처럼 배열을 인자로 펼치는 관용구는 목록이 길어지면 호출 인자 한계에 걸립니다.
같은 일을 하는 코드가 파일마다 조금씩 다른 모양으로 남는 것이 더 큰 비용입니다.

| 갈래 | 손으로 쓰던 것 | 쓸 함수 |
| --- | --- | --- |
| 배열 | 중복 제거, 키로 묶기, 키로 색인 | `uniq`, `uniqBy`, `groupBy`, `keyBy` |
| 배열 | 차집합, 교집합, 합집합, 값 하나 빼기, 토글 | `difference`, `intersection`, `union`, `without`, `xor` |
| 배열 | 정렬, 일정 크기로 자르기, 조건으로 가르기 | `sortBy`, `orderBy`, `chunk`, `partition` |
| 배열 | 길이만큼 도는 자리 | `range` |
| 객체 | 복사, 깊은 비교 | `clone`, `cloneDeep`, `isEqual` |
| 객체 | 필드 골라내기, 빼기, 값만 바꾸기 | `pick`, `omit`, `mapValues` |
| 문자열 | 표기 바꾸기, HTML escape | `camelCase`, `snakeCase`, `kebabCase`, `pascalCase`, `capitalize`, `escape` |
| 함수 | 호출 빈도 조절, 한 번만, 결과 기억 | `debounce`, `throttle`, `once`, `memoize` |
| 숫자 | 집계, 범위 제한, 최댓값과 최솟값 | `sum`, `sumBy`, `mean`, `clamp`, `maxBy`, `minBy` |
| 판정 | 빈 값과 형 검사 | `isNil`, `isNotNil`, `isEmptyObject`, `isPlainObject` |
| 비동기 | 지연, 시간 제한, 재시도 | `delay`, `withTimeout`, `retry` |

표에 없어도 `es-toolkit` 문서에 같은 뜻의 함수가 있으면 그 함수를 씁니다.
`lodash`는 새로 들이지 않습니다.
날짜는 `values-handle-dates-with-dayjs`가 보고, 정렬은 `values-prefer-immutable-array-sorting`이 봅니다.

**표준 메서드 하나로 끝나는 것은 그대로 둡니다.**
`map`, `filter`, `find`, `flat`, `at`, `Object.keys`를 감싸지 않습니다.
공백만 떼는 것도 표준 `value.trim()`입니다.
`es-toolkit`은 표준 메서드가 없거나 여러 줄로 흩어질 때 씁니다.
자를 문자를 지정하는 `trim(value, "_")`가 그 자리입니다.

**이름이 같아도 뜻이 다르면 갈아타지 않습니다.**
`es-toolkit`의 `compact`는 falsy를 모두 버리고, 프로젝트가 쓰던 `compact`는 `null`과 `undefined`만 버립니다.
뜻이 다르면 프로젝트 래퍼를 남기고 안을 `es-toolkit`으로 채웁니다.
이때 두 뜻의 차이를 고정하는 테스트를 함께 남깁니다.

**갈아탈 때 어느 항목이 남는지 확인합니다.**
`new Map(items.map(…)).values()`로 중복을 지우면 뒤에 온 항목이 남고, `uniqBy`는 앞에 온 항목이 남습니다.
남길 쪽을 앞으로 옮기지 않으면 결과가 조용히 뒤집힙니다.

**빈 목록 가드는 결과 가드로 합칩니다.**
`minBy`와 `maxBy`는 빈 배열에서 `undefined`를 돌려줍니다.
`length === 0`을 먼저 보고 다시 `Math.min`을 부르지 않고, 결과가 `undefined`인지만 봅니다.
값을 뽑으려고 만들던 중간 `map` 배열도 같이 사라집니다.

**반복 조회는 `Set`과 `Map`이 맡습니다.**
`groupBy`와 `keyBy`는 목록을 다시 짜는 함수입니다.
조회 자리를 `Map`으로 정리하는 것은 `values-use-set-and-map-for-repeated-lookups`가 봅니다.

**Incorrect (중복 제거를 인덱스 비교와 `Set` 왕복으로 직접 씁니다):**

```ts
const uniqueOwnerIds = ownerIds.filter((ownerId, index) => ownerIds.indexOf(ownerId) === index);
const uniqueCategories = [...new Set(points.map((point) => point.x))];
```

**Incorrect (`reduce`로 그룹 짓기를 다시 만듭니다):**

```ts
const productsByCategory = products.reduce<Record<string, Product[]>>((grouped, product) => {
	grouped[product.category] = [...(grouped[product.category] ?? []), product];
	return grouped;
}, {});
```

**Incorrect (`JSON` 왕복으로 깊은 복사를 흉내 냅니다):**

```ts
const draftFilter = JSON.parse(JSON.stringify(savedFilter)) as ProductFilter;
```

**Incorrect (정규식으로 표기를 바꿉니다):**

```ts
const searchKey = rawKey.replace(/([A-Z])/g, "_$1").toLowerCase();
```

**Incorrect (`Array.from`에 쓰지 않는 첫 인자를 두고 길이만큼 돌립니다):**

```ts
const tickTimes = Array.from({length: tick_count}, (_unused, tickIndex) => toTickTime(tickIndex));
```

**Incorrect (빈 목록을 먼저 가드하고 중간 배열을 만들어 양 끝을 읽습니다):**

```ts
const toChartBounds = (points: readonly ChartPoint[]) => {
	const yValues = points.map((point) => point.y);

	if (yValues.length === 0) {
		return undefined;
	}

	return {min: Math.min(...yValues), max: Math.max(...yValues)};
};
```

**Correct (`es-toolkit` 함수를 그대로 부릅니다):**

```ts
import {cloneDeep, groupBy, range, snakeCase, uniq} from "es-toolkit";

const uniqueOwnerIds = uniq(ownerIds);
const productsByCategory = groupBy(products, (product) => product.category);
const draftFilter = cloneDeep(savedFilter);
const searchKey = snakeCase(rawKey);
const tickTimes = range(tick_count).map((tickIndex) => toTickTime(tickIndex));
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
