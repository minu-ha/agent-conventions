---
title: Justify Convention Exceptions With a Checkable Reason Comment
titleKo: 컨벤션 예외에는 확인할 수 있는 이유를 적습니다
impact: MEDIUM
impactDescription: 예외가 취향인지 근거가 있는지 코드에서 바로 드러납니다
appliesWhen:
  - 규칙이 허용한 예외를 코드에 남길 때
  - 이미 있는 예외 주석의 내용을 바꿀 때
  - 제외: 규칙이 요구하지 않은 일반 설명 주석인 경우
reviewWith: docs-write-concise-korean-comments-about-purpose-and-constraints
tags: docs, comments
---

## Justify Convention Exceptions With a Checkable Reason Comment

**Impact: MEDIUM (예외가 취향인지 근거가 있는지 코드에서 바로 드러납니다)**

여러 규칙이 예외를 허용하면서 "이유를 주석으로 남긴다"를 조건으로 답니다.
그 주석의 기준을 여기서 한 번만 정합니다.

이유 주석은 **다른 사람이 확인할 수 있는 것**을 가리켜야 합니다.

| 확인할 수 있는 근거 | 예 |
| --- | --- |
| 외부 패키지와 그 제약 | 어떤 라이브러리의 어떤 API가 무엇을 요구하는지 |
| 측정 결과 | 무엇을 재서 얼마가 나왔는지 |
| 제품 명세나 티켓 | 결정이 적힌 곳 |
| 상수 | `constant` 폴더에 선언된 이름 |

"성능을 위해", "안전하게", "필요해서"처럼 다시 확인할 수 없는 말은 근거가 아닙니다.
그런 주석은 예외 조건을 채우지 못합니다.

주석은 예외가 일어나는 줄 바로 위에 `//`로 씁니다.
JSX 자식 자리에는 `//`가 없어 프레임워크 규칙이 정한 형태로 씁니다.
어투와 내용은 `docs-write-concise-korean-comments-about-purpose-and-constraints`를 따릅니다.

**Incorrect (확인할 수 없는 말로 예외를 정당화합니다):**

```ts
// 성능을 위해 메모이제이션
const columns = useMemo(() => toTableColumns(response.data.columns), [response.data.columns]);
```

**Correct (외부 패키지의 제약을 가리킵니다):**

```ts
// ag-grid는 columnDefs 참조가 바뀌면 컬럼 상태를 초기화한다. 참조를 고정해야 한다.
const columns = useMemo(() => toTableColumns(response.data.columns), [response.data.columns]);
```

**Correct (측정 결과를 가리킵니다):**

```ts
// 행 5,000개에서 매 렌더 필터링이 120ms로 측정됐다. 지연한 검색어에만 다시 계산한다.
const filteredRows = useMemo(() => rows.filter((row) => matchRow(row, deferredKeyword)), [deferredKeyword, rows]);
```
