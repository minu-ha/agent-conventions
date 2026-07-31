---
title: Use useEffectEvent for Non-reactive Effect Callbacks
titleKo: 비반응성 effect 콜백의 useEffectEvent 사용
impact: MEDIUM-HIGH
impactDescription: 최신 handler 로직은 읽으면서 effect는 실제 구독에만 반응하게 유지합니다
appliesWhen:
  - subscription effect가 최신 prop·state callback을 읽어야 할 때
  - ref 동기화 hack, dependency 재설치, `useEffectEvent`를 추가·변경할 때
requiresSelected: docs-require-jsdoc-on-key-declarations
reviewWith: events-run-user-actions-in-handlers-not-effects
tags: state, react19, useeffectevent, effects
---

## Use useEffectEvent for Non-reactive Effect Callbacks

**Impact: MEDIUM-HIGH (최신 handler 로직은 읽으면서 effect는 실제 구독에만 반응하게 유지합니다)**

effect 안에서 최신 prop이나 state를 읽어야 하지만 그 값 변화가 subscription 재설치를
일으키면 안 되는 경우, ref hack 대신 `useEffectEvent`를 씁니다.

event handler를 effect로 옮기라는 뜻이 아닙니다.
실제 구독·연결 effect 안에서만 쓰고, 클릭·제출 같은 사용자 액션은 named handler에 둡니다.

**Incorrect (최신 callback을 위해 ref를 수동 동기화):**

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

**Correct (non-reactive callback은 `useEffectEvent`로 분리):**

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
