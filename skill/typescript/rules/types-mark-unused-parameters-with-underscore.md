---
title: Mark Unused Parameters With an Underscore Prefix
impact: MEDIUM-HIGH
impactDescription: makes intentionally ignored callback parameters explicit instead of silently dropping parts of a contract
tags: parameters, callbacks, naming
---

## Mark Unused Parameters With an Underscore Prefix

**Impact: MEDIUM-HIGH (makes intentionally ignored callback parameters explicit instead of silently dropping parts of a contract)**

미사용 매개변수도 생략하지 않고 `_` 접두사로 명시합니다. 이렇게 해야 callback 시그니처 계약을 유지하면서도, 현재 구현에서 의도적으로 쓰지 않는 값이라는 점이 드러납니다.

**Incorrect (계약의 일부인 callback 매개변수를 조용히 생략):**

```ts
type LogSink = (message: string, level: "info" | "error") => void;

const noopLog: LogSink = () => {
	// no-op sink
};
```

**Correct (계약은 유지하고 미사용 매개변수만 `_`로 표시):**

```ts
type LogSink = (message: string, level: "info" | "error") => void;

const noopLog: LogSink = (_message, _level) => {
	// no-op sink
};
```
