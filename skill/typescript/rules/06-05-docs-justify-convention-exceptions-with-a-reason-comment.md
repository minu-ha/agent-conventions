---
title: Justify Convention Exceptions With a Checkable Reason Comment
titleKo: 컨벤션 예외에는 확인할 수 있는 이유를 적습니다
impact: MEDIUM
impactDescription: 예외가 취향인지 근거가 있는지 코드에서 바로 드러납니다
appliesWhen:
  - 규칙이 허용한 예외를 코드에 남길 때
  - 이미 있는 예외 주석의 내용을 바꿀 때
  - 제외: 규칙이 요구하지 않은 일반 설명 주석인 경우
reviewWith: docs-write-korean-comments-about-purpose-and-constraints
tags: docs, comments
---

## Justify Convention Exceptions With a Checkable Reason Comment

**Impact: MEDIUM (예외가 취향인지 근거가 있는지 코드에서 바로 드러납니다)**

### 확인할 수 있는 근거

규칙이 허용한 예외에는 다른 사람이 확인할 수 있는 근거를 주석으로 남깁니다.
“성능을 위해”, “안전하게”, “필요해서”처럼 확인할 수 없는 말은 예외의 근거가 되지 않습니다.

| 근거 | 적을 내용 |
| --- | --- |
| 외부 패키지 · API 제약 | 어떤 API가 무엇을 요구하는지 |
| 측정 결과 | 측정 대상과 수치 |
| 제품 명세 · 티켓 | 결정이 기록된 위치 |
| 상수 | `constant` 폴더에 선언된 이름 |

### 주석 자리

이유를 적을 자리를 고르는 차례입니다.

```mermaid
flowchart LR
	q1{"헤더 문서 주석이<br>있는 선언인가?"} -- 아니요 --> q2{"JSX 자식인가?"} -- 아니요 --> r3("해당 줄 바로 위에 //")
	q1 -- 예 --> r1("헤더 블록 안에 이유")
	q2 -- 예 --> r2("프레임워크 규칙이<br>정한 형태")
```

어투와 내용은 `docs-write-korean-comments-about-purpose-and-constraints`를 따릅니다.

**Incorrect 1 (확인할 수 없는 말로 예외를 정당화합니다):**

```ts
// 성능을 위해 메모이제이션
const columns = useMemo(() => {
	return toTableColumns(responseTableColumnsSuspense.data.columns);
}, [responseTableColumnsSuspense.data.columns]);
```

**Correct 1 (외부 패키지의 제약을 가리킵니다):**

```ts
// MUI Data Grid는 columns 참조가 바뀌면 열 너비나 순서를 잃을 수 있어 참조를 유지한다.
const columns = useMemo(() => {
	return toTableColumns(responseTableColumnsSuspense.data.columns);
}, [responseTableColumnsSuspense.data.columns]);
```

**Incorrect 2 (막연한 말이라 무엇을 재서 넣었는지 알 수 없습니다):**

```ts
// 안전하게 다시 계산하지 않도록
const filteredRows = useMemo(() => {
	return rows.filter((row) => matchRow(row, deferredKeyword));
}, [deferredKeyword, rows]);
```

**Correct 2 (측정 결과를 가리킵니다):**

```ts
// 행 5,000개에서 매 렌더 필터링이 120ms로 측정됐다. 지연한 검색어에만 다시 계산한다.
const filteredRows = useMemo(() => {
	return rows.filter((row) => matchRow(row, deferredKeyword));
}, [deferredKeyword, rows]);
```
