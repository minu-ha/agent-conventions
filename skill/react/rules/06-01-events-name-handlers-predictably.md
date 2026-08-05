---
title: Name Handlers Predictably
titleKo: 핸들러 이름은 `handle` 접두사 규칙으로 짓습니다
impact: MEDIUM-HIGH
impactDescription: 이벤트 흐름을 이름으로 검색할 수 있습니다
appliesWhen:
  - 이벤트 핸들러를 새로 만들 때
  - 핸들러 이름이나 대상, 이벤트 표기를 바꿀 때
reviewWith: typescript/naming-use-consistent-file-and-symbol-naming
tags: events, naming
---

## Name Handlers Predictably

**Impact: MEDIUM-HIGH (이벤트 흐름을 이름으로 검색할 수 있습니다)**

이벤트 핸들러는 `handle` 접두사와 역할명을 씁니다.

| 상황 | 이름 |
| --- | --- |
| DOM 이벤트 | `handle + Target + Event` |
| 한 컴포넌트에 그 동작의 트리거가 하나뿐일 때 | `handle + DomainAction` |

- `on*`은 프롭 이름입니다.
  구현에는 쓰지 않습니다.
  `onClick`을 받아 처리하는 함수는 `handleRowClick`입니다.
- 같은 컴포넌트에 같은 이름의 핸들러를 두지 않습니다.
  대상이 다르면 대상 이름을 넣습니다.
- 추가 인자를 어떻게 넘길지는 `events-curry-extra-handler-arguments`가 정합니다.

**Incorrect (`on*` 접두사와 제각각인 이름):**

```ts
import type { MouseEvent } from "react";

const onSelect = (id: string, event: MouseEvent<HTMLLIElement>) => {
  console.log(id, event.currentTarget);
};

const clickHandler2 = (event: MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
};
```

**Correct (`handle` 접두사와 대상·이벤트가 드러나는 이름):**

```ts
import type { MouseEventHandler } from "react";

/**
 * 목록 항목 클릭 시 선택 상태 전환
 */
const handleListItemClick: MouseEventHandler<HTMLLIElement> = (_event) => {
  toggleSelection();
};

/**
 * 저장 버튼 클릭 기본 동작 차단
 */
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = (event) => {
  event.preventDefault();
};
```
