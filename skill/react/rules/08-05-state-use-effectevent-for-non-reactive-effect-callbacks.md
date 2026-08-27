---
title: Use useEffectEvent for Non-reactive Effect Callbacks
titleKo: 이펙트를 다시 돌리지 않아야 할 콜백은 `useEffectEvent`로 감쌉니다
impact: MEDIUM-HIGH
impactDescription: 핸들러 로직은 최신으로 읽고 이펙트는 실제 구독에만 반응합니다
appliesWhen:
  - 구독 이펙트가 최신 프롭·상태 콜백을 읽어야 할 때
  - ref 동기화 우회, 의존성 재설치, `useEffectEvent`를 추가·변경할 때
reviewWith: >-
  docs-require-jsdoc-on-key-declarations, events-curry-extra-handler-arguments,
  events-run-user-actions-in-handlers-not-effects
tags: state, effects
---

## Use useEffectEvent for Non-reactive Effect Callbacks

**Impact: MEDIUM-HIGH (핸들러 로직은 최신으로 읽고 이펙트는 실제 구독에만 반응합니다)**

이펙트 안에서 최신 프롭이나 상태를 읽어야 하는데 그 값이 바뀔 때마다 구독을 다시 설치하면 안 됩니다.
이때 `ref` 우회 대신 `useEffectEvent`를 씁니다.

이벤트 핸들러를 이펙트로 옮기라는 뜻이 아닙니다.
실제 구독·연결 이펙트 안에서만 쓰고, 클릭·제출 같은 사용자 액션은 이름 붙인 핸들러에 둡니다.

- `useEffectEvent`는 리액트 19.2 이상에만 있습니다.
  그보다 낮으면 이 규칙을 적용하지 않고, 아래 Incorrect의 `ref` 동기화가 유일한 대안입니다.
- 린터 버전도 함께 확인합니다.
  리액트 19.2 문서는 `eslint-plugin-react-hooks`를 최신 버전으로 올리라고 요구합니다.
  `biome`도 최근 버전에서야 `useEffectEvent`를 인식합니다.
  설정은 `typescript/tooling-configure-biome-to-enforce-these-rules`에 있습니다.
  낡은 버전에서는 아래 Correct 예제가 훅 규칙 위반으로 표시됩니다.
- `useEffectEvent`로 감싼 콜백에는 DOM 이벤트 매개변수나 커링을 덧붙이지 않습니다.
  이펙트 안에서만 부르고 JSX 이벤트 프롭에 전달하지 않는 콜백입니다.
  그래서 `typing-take-handler-types-from-existing-contracts`의 리액트 핸들러 타입 규칙은 이 자리에 적용하지 않습니다.

**Incorrect (최신 콜백을 위해 `ref`를 수동 동기화):**

```tsx
const onMessageRef = useRef(onMessage);

useEffect(() => {
	onMessageRef.current = onMessage;
}, [onMessage]);

useEffect(() => {
	const unsubscribe = socket.subscribe((message) => {
		onMessageRef.current(message);
	});

	return unsubscribe;
}, [socket]);
```

**Correct (non-reactive 콜백은 `useEffectEvent`로 분리):**

```tsx
/**
 * socket message 수신 시 최신 onMessage 로직 실행
 */
const handleMessage = useEffectEvent((message: SocketMessage) => {
	onMessage(message);
});

/**
 * socket subscription lifecycle 유지
 */
useEffect(() => {
	const unsubscribe = socket.subscribe((message) => {
		handleMessage(message);
	});

	return unsubscribe;
}, [socket]);
```
