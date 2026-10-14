---
title: Avoid Imperative Assembly in Wide Scopes
titleKo: 넓은 스코프에서 `let` 재할당과 `push`로 값을 쌓지 않습니다
impact: HIGH
impactDescription: 분기로 공유 지역 변수를 바꾸지 않아 넓은 스코프의 값 조립이 선언형으로 남습니다
appliesWhen:
  - 모듈 최상위나 함수 본문 전체를 덮는 스코프에서 `let` 재할당, 배열 `push`, 조건부 누적으로 값을 만들 때
  - 삼항 안에 삼항을 넣을 때
reviewWith: functions-extract-helpers-only-when-the-boundary-is-real
tags: functions
---

## Avoid Imperative Assembly in Wide Scopes

**Impact: HIGH (분기로 공유 지역 변수를 바꾸지 않아 넓은 스코프의 값 조립이 선언형으로 남습니다)**

모듈 최상위나 함수 본문 전체에 걸친 `let` 재할당, `push`, 조건부 누적으로 값을 조립하지 않습니다.
`if`나 `for` 블록 안에서만 쓰는 누적은 대상이 아닙니다.

```mermaid
flowchart LR
	q1{"목록에 조건부<br>항목을 넣는가?"} -- 아니요 --> q2{"값 하나가 두 분기로<br>갈리는가?"} -- 예 --> r2("삼항 하나")
	q1 -- 예 --> r1("조건부 스프레드나 filter")
	q2 -- 아니요 --> r3("분기마다 return 으로<br>끝나는 함수로 추출")
```

추출 여부는 `functions-extract-helpers-only-when-the-boundary-is-real`,
함수 이름은 `functions-name-functions-by-what-comes-out`을 따릅니다.

**Incorrect 1 (넓은 스코프에서 명령형으로 조립을 쌓습니다):**

<<< ../examples/functions-avoid-imperative-assembly-in-wide-scopes/01-incorrect.ts

**Correct 1 (조건부 스프레드로 한 번에 계산합니다):**

<<< ../examples/functions-avoid-imperative-assembly-in-wide-scopes/02-correct.ts

**Incorrect 2 (삼항 안에 삼항을 넣어 값 하나를 고릅니다):**

<<< ../examples/functions-avoid-imperative-assembly-in-wide-scopes/03-incorrect.ts

**Correct 2 (분기가 셋이면 `return`으로 끝나는 함수로 뺍니다):**

<<< ../examples/functions-avoid-imperative-assembly-in-wide-scopes/04-correct.ts

**Incorrect 3 (목록 조립에서 조건이 셋이 되자 삼항을 겹칩니다):**

<<< ../examples/functions-avoid-imperative-assembly-in-wide-scopes/05-incorrect.ts

**Correct 3 (조건이 셋 이상인 목록은 표로 두고 걸러 냅니다):**

<<< ../examples/functions-avoid-imperative-assembly-in-wide-scopes/06-correct.ts
