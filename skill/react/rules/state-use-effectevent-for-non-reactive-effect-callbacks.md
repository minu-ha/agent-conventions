---
title: Use useEffectEvent for Non-reactive Effect Callbacks
impact: MEDIUM-HIGH
impactDescription: keeps effects reactive only to true subscriptions while still reading the latest handler logic
appliesWhen: subscription effect가 최신 prop·state callback을 읽도록 ref 동기화 hack, dependency 재설치 또는 `useEffectEvent`를 추가·변경한다.
requiresSelected: docs-require-jsdoc-on-key-declarations
reviewWith: events-run-user-actions-in-handlers-not-effects
tags: state, react19, useeffectevent, effects
---

## Use useEffectEvent for Non-reactive Effect Callbacks

**Impact: MEDIUM-HIGH (keeps effects reactive only to true subscriptions while still reading the latest handler logic)**

effect 안에서 최신 prop이나 state를 읽어야 하지만, 그 값 변화 자체가 subscription 재설치를 일으키면 안 되는 경우에는 ref hack 대신 `useEffectEvent`를 우선합니다.
이 규칙은 event handler를 effect로 옮기라는 뜻이 아닙니다.
진짜 구독/연결 effect 안에서만 쓰고, 클릭/제출 같은 사용자 액션은 여전히 named handler에 둡니다.

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
 * @event socket message 수신 시 최신 onMessage 로직 실행
 */
const handleMessage = useEffectEvent((message: SocketMessage) => {
	onMessage(message);
});

/**
 * @watch socket subscription lifecycle 유지
 */
useEffect(() => {
	const unsubscribe = socket.subscribe((message) => {
		handleMessage(message);
	});

	return unsubscribe;
}, [socket]);
```
