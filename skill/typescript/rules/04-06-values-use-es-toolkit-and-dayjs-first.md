---
title: Use es-toolkit and dayjs First
titleKo: 직접 만들지 않고 `es-toolkit`과 `dayjs`를 씁니다
impact: MEDIUM-HIGH
impactDescription: 중복 제거, 표기 변환, 날짜 계산을 파일마다 다르게 만들지 않고 검증된 구현 하나로 모읍니다
appliesWhen:
  - 배열, 객체, 문자열, 날짜를 다루는 보조 코드를 추가·변경할 때
  - `reduce`, `Object.entries`, 정규식, `new Date` 산술로 값을 다시 짜는 코드를 쓸 때
  - 제외: 표준 메서드 하나로 끝나는 경우
reviewWith: values-prefer-immutable-array-sorting, functions-extract-helpers-only-when-the-boundary-is-real
tags: values, es-toolkit, dayjs
---

## Use es-toolkit and dayjs First

**Impact: MEDIUM-HIGH (중복 제거, 표기 변환, 날짜 계산을 파일마다 다르게 만들지 않고 검증된 구현 하나로 모읍니다)**

값을 다루는 보조 함수는 `es-toolkit`에서 먼저 찾습니다.
날짜는 `dayjs`로 다룹니다.
둘 다 `clsx`와 같은 자리입니다.
쓸지 말지 고르는 라이브러리가 아니라 기본값입니다.

직접 쓴 구현은 빈 배열, 중복 키, 월말 같은 경계에서 저마다 다르게 틀립니다.
같은 일을 하는 코드가 파일마다 조금씩 다른 모양으로 남는 것이 더 큰 비용입니다.

| 갈래 | 손으로 쓰던 것 | 쓸 함수 |
| --- | --- | --- |
| 배열 | 중복 제거, 키로 묶기, 키로 색인 | `uniq`, `uniqBy`, `groupBy`, `keyBy` |
| 배열 | 차집합, 교집합, 합집합 | `difference`, `intersection`, `union` |
| 배열 | 정렬, 일정 크기로 자르기, 조건으로 가르기 | `sortBy`, `orderBy`, `chunk`, `partition` |
| 객체 | 복사, 깊은 비교 | `clone`, `cloneDeep`, `isEqual` |
| 객체 | 필드 골라내기, 빼기, 값만 바꾸기 | `pick`, `omit`, `mapValues` |
| 문자열 | 표기 바꾸기 | `camelCase`, `snakeCase`, `kebabCase`, `pascalCase`, `capitalize` |
| 함수 | 호출 빈도 조절, 한 번만, 결과 기억 | `debounce`, `throttle`, `once`, `memoize` |
| 숫자 | 집계, 범위 제한, 연속 값 | `sum`, `sumBy`, `mean`, `clamp`, `round`, `range` |
| 판정 | 빈 값과 형 검사 | `isNil`, `isNotNil`, `isEmptyObject`, `isPlainObject` |
| 비동기 | 지연, 시간 제한, 재시도 | `delay`, `withTimeout`, `retry` |
| 날짜 | 파싱, 형식, 더하기와 빼기, 비교 | `dayjs` |

표에 없어도 `es-toolkit` 문서에 같은 뜻의 함수가 있으면 그 함수를 씁니다.
`lodash`와 `moment`는 새로 들이지 않습니다.

**표준 메서드 하나로 끝나는 것은 그대로 둡니다.**
`map`, `filter`, `find`, `flat`, `at`, `trim`, `padStart`, `Object.keys`를 감싸지 않습니다.
`es-toolkit`은 표준 메서드가 없거나 여러 줄로 흩어질 때 씁니다.

**반복 조회는 `Set`과 `Map`이 맡습니다.**
`groupBy`와 `keyBy`는 목록을 다시 짜는 함수입니다.
조회 자리를 `Map`으로 정리하는 것은 `values-use-set-and-map-for-repeated-lookups`가 봅니다.

**Incorrect (중복 제거를 인덱스 비교로 직접 씀):**

```ts
const uniqueOwnerIds = ownerIds.filter((ownerId, index) => ownerIds.indexOf(ownerId) === index);
```

**Incorrect (`reduce`로 그룹 짓기를 다시 만듦):**

```ts
const productsByCategory = products.reduce<Record<string, Product[]>>((grouped, product) => {
	grouped[product.category] = [...(grouped[product.category] ?? []), product];
	return grouped;
}, {});
```

**Incorrect (`JSON` 왕복으로 깊은 복사를 흉내 냄):**

```ts
const draftFilter = JSON.parse(JSON.stringify(savedFilter)) as ProductFilter;
```

**Incorrect (정규식으로 표기를 바꾸고 밀리초로 날짜를 계산함):**

```ts
const searchKey = rawKey.replace(/([A-Z])/g, "_$1").toLowerCase();
const expiresAt = new Date(issuedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
```

**Correct (`es-toolkit` 함수를 그대로 부름):**

```ts
import {cloneDeep, groupBy, snakeCase, uniq} from "es-toolkit";

const uniqueOwnerIds = uniq(ownerIds);
const productsByCategory = groupBy(products, (product) => product.category);
const draftFilter = cloneDeep(savedFilter);
const searchKey = snakeCase(rawKey);
```

**Correct (날짜 계산과 형식은 `dayjs`):**

```ts
import dayjs from "dayjs";

const expiresAt = dayjs(issuedAt).add(7, "day");
const expiresLabel = expiresAt.format("YYYY.MM.DD");
```

**Correct (표준 메서드 하나로 끝나면 감싸지 않음):**

```ts
const activeProducts = products.filter((product) => product.isActive);
const trimmedKeyword = keyword.trim();
```
