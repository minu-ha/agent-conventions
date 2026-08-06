---
title: Mark Unused Parameters With an Underscore Prefix
titleKo: 쓰지 않는 매개변수도 밑줄을 붙여 남깁니다
impact: MEDIUM
impactDescription: 계약의 일부를 조용히 버리지 않고 일부러 무시한 매개변수를 드러냅니다
appliesWhen:
  - 기존 콜백이나 프레임워크 계약을 구현하면서 매개변수를 빼거나 쓰지 않을 때
  - 커링한 핸들러가 마지막에 돌려주는 콜백에서 매개변수를 뺄 때
tags: types, callbacks, naming
---

## Mark Unused Parameters With an Underscore Prefix

**Impact: MEDIUM (계약의 일부를 조용히 버리지 않고 일부러 무시한 매개변수를 드러냅니다)**

미사용 매개변수도 생략하지 않고 `_` 접두사로 명시합니다.
그래야 콜백 시그니처를 그대로 지키면서, 지금 구현이 일부러 쓰지 않는 값이라는 점이 드러납니다.

프레임워크 별칭이나 기존 콜백 계약이 선언한 매개변수를 구현에서 빼면 이 규칙을 적용합니다.
커링한 핸들러의 마지막 콜백도 예외가 아닙니다.
매개변수를 쓰지 않는 경우도 예외가 아닙니다.

`MouseEventHandler`를 돌려주면서 이벤트 매개변수를 쓰지 않아도 `() =>`로 줄이지 않습니다.
`(_event) =>`로 받아 계약을 남깁니다.

**Incorrect (계약의 일부인 콜백 매개변수를 조용히 생략):**

```ts
type LogSink = (message: string, level: "info" | "error") => void;

const noopLog: LogSink = () => {
	// no-op sink
};
```

**Correct (계약은 유지하고 미사용 매개변수만 `_`로 표시):**

```ts
/**
 * 로그 sink 콜백 계약
 */
type LogSink = (message: string, level: "info" | "error") => void;

/**
 * 아무것도 남기지 않는 로그 sink. 테스트에서 출력을 끌 때 쓴다
 */
const noopLog: LogSink = (_message, _level) => {};
```
