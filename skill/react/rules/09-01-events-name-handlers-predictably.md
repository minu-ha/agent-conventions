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

이벤트 핸들러는 `handle` 접두사와 역할명을 씁니다.

| 상황 | 이름 |
| --- | --- |
| DOM 이벤트 | `handle + Target + Event` |
| 그 동작을 일으키는 요소가 컴포넌트에 하나뿐일 때 | `handle + DomainAction` |

- `on*`은 프롭 이름입니다.
  구현에는 쓰지 않습니다.
  `onClick`을 받아 처리하는 함수는 `handleRowClick`입니다.
- 같은 컴포넌트에 같은 이름의 핸들러를 두지 않습니다.
  대상이 다르면 대상 이름을 넣습니다.
- 추가 인자를 어떻게 넘길지는 `events-curry-extra-handler-arguments`가 정합니다.

**Incorrect (구현에 `on*`을 쓰고 대상이 이름에 없어 같은 이름이 겹침):**

```ts
import type {MouseEvent} from "react";

// 목록 항목과 저장 버튼 둘 다 클릭을 받는데 이름에 대상이 없어 뒤에 번호가 붙었다
const onClick = (event: MouseEvent<HTMLLIElement>) => {
	toggleSelection();
};

const onClick2 = (event: MouseEvent<HTMLButtonElement>) => {
	event.preventDefault();
};
```

**Correct (`handle` 접두사와 대상·이벤트가 드러나는 이름):**

```ts
import type {MouseEventHandler} from "react";

/**
 * 이미 고른 항목을 다시 누르면 선택을 해제한다
 */
const handleListItemClick: MouseEventHandler<HTMLLIElement> = (_event) => {
	toggleSelection();
};

/**
 * 폼 기본 제출을 막는다. 저장은 mutation 콜백이 이어서 한다
 */
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = (event) => {
	event.preventDefault();
};
```
