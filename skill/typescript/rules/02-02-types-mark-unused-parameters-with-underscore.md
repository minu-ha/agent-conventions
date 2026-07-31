---
title: Mark Unused Parameters With an Underscore Prefix
titleKo: 미사용 매개변수의 밑줄 접두사 표기
impact: MEDIUM-HIGH
impactDescription: 계약의 일부를 조용히 버리지 않고 의도적으로 무시한 callback 매개변수를 드러냅니다
appliesWhen:
  - 기존 callback·framework 계약 구현을 추가·변경하며 parameter를 생략하거나 사용하지 않을 때
  - curried handler가 반환하는 최종 callback에서 parameter를 생략할 때
tags: parameters, callbacks, naming
---

## Mark Unused Parameters With an Underscore Prefix

**Impact: MEDIUM-HIGH (계약의 일부를 조용히 버리지 않고 의도적으로 무시한 callback 매개변수를 드러냅니다)**

미사용 매개변수도 생략하지 않고 `_` 접두사로 명시합니다.
이렇게 해야 callback 시그니처 계약을 유지하면서도, 현재 구현에서 의도적으로 쓰지 않는 값이라는 점이 드러납니다.

curried handler의 최종 callback을 포함해,
framework alias나 기존 callback 계약이 선언한 매개변수를 구현 함수에서 생략하는 경우도 Selected입니다.
`MouseEventHandler`를 반환하면서 event 매개변수를 쓰지 않는다면 매개변수 생략은 N/A 근거가 아니며,
`() =>` 대신 `_event`를 받는 `(_event) =>`로 계약을 보존합니다.

**Incorrect (계약의 일부인 callback 매개변수를 조용히 생략):**

```ts
type LogSink = (message: string, level: "info" | "error") => void;

const noopLog: LogSink = () => {
	// no-op sink
};
```

**Correct (계약은 유지하고 미사용 매개변수만 `_`로 표시):**

```ts
/**
 * @summary 로그 sink 콜백 계약
 */
type LogSink = (message: string, level: "info" | "error") => void;

const noopLog: LogSink = (_message, _level) => {};
```
