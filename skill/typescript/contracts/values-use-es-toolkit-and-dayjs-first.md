# Use es-toolkit and dayjs First

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

> 예시·예외가 필요하면 [full rule](../rules/04-06-values-use-es-toolkit-and-dayjs-first.md)을 읽습니다.
