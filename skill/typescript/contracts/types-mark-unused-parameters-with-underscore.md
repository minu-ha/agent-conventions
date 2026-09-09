# Mark Unused Parameters With an Underscore Prefix

**Impact: MEDIUM (계약에 있는 매개변수를 유지하면서 사용하지 않는 매개변수를 표시합니다)**

기존 콜백 · 프레임워크 계약의 매개변수는 쓰지 않아도 생략하지 않고 `_` 접두사로 남깁니다.
계약을 유지하면서 구현이 일부러 무시한 값을 드러냅니다.

커링한 핸들러의 마지막 콜백과 매개변수를 하나도 쓰지 않는 구현도 같습니다.
`MouseEventHandler`의 이벤트를 쓰지 않으면 `() =>` 대신 `(_event) =>`로 받습니다.

**Incorrect 1 (계약의 일부인 콜백 매개변수를 생략합니다):**

```ts
/**
 * 로그 sink 콜백 계약
 */
type LogSink = (message: string, level: "info" | "error") => void;

const noopLog: LogSink = () => {
	// 아무 일도 하지 않는 sink
};
```

**Correct 1 (계약은 유지하고 쓰지 않는 매개변수만 `_`로 표시합니다):**

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

> 나머지 예시 · 예외는 [full rule](../rules/01-05-types-mark-unused-parameters-with-underscore.md)에 있습니다.
