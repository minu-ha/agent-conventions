---
title: Name Handlers Predictably
titleKo: 핸들러 이름에 `handle` 접두사를 붙입니다
impact: MEDIUM
impactDescription: 이벤트 흐름을 이름으로 검색할 수 있습니다
appliesWhen:
  - 이벤트 핸들러를 새로 만들 때
  - 핸들러 이름이나 대상, 이벤트 표기를 바꿀 때
reviewWith: typescript/naming-use-consistent-file-and-symbol-naming, events-curry-extra-handler-arguments
tags: events, naming
---

## Name Handlers Predictably

**Impact: MEDIUM (이벤트 흐름을 이름으로 검색할 수 있습니다)**

이벤트 핸들러는 `handle` 접두사에 대상과 역할을 붙입니다.
표를 위에서부터 읽어 처음 해당하는 형태를 씁니다.

| 상황 | 이름 |
| --- | --- |
| DOM 이벤트 객체를 받음 | `handle + Target + Event` |
| 이벤트 객체를 받지 않는 도메인 콜백 | `handle + DomainAction` |

`on*`은 프롭 이름에만 쓰고, `onClick`을 처리하는 구현은 `handleRowClick`처럼 이름 짓습니다.
같은 컴포넌트에서 이름이 겹치지 않도록 대상이 다르면 대상 이름을 넣습니다.

**Incorrect 1 (구현에 `on*`을 쓰고 대상이 이름에 없어 같은 이름이 겹칩니다):**

<<< ../examples/events-name-handlers-predictably/01-incorrect.ts

**Correct 1 (`handle` 접두사와 대상, 이벤트가 드러나는 이름을 씁니다):**

<<< ../examples/events-name-handlers-predictably/02-correct.ts
