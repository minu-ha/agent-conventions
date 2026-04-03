---
title: Run User Actions in Handlers, Not Effects
impact: HIGH
impactDescription: avoids modeling one-shot user actions as state plus effect replays
tags: events, handlers, effects, actions
---

## Run User Actions in Handlers, Not Effects

**Impact: HIGH (avoids modeling one-shot user actions as state plus effect replays)**

제출, 저장, 삭제, 닫기 같은 사용자 액션은 해당 handler 안에서 바로 실행합니다.   
액션 자체를 state로 올린 뒤 `useEffect`가 나중에 실행하게 만들면 unrelated dependency 변화에도 재실행되기 쉽고, 흐름도 읽기 어려워집니다.

**Incorrect (사용자 액션을 state + effect로 모델링):**

```tsx
const [shouldSubmit, setShouldSubmit] = useState(false);

useEffect(() => {
	if (!shouldSubmit) {
		return;
	}

	void createEntryMutation.mutateAsync(formValues);
}, [createEntryMutation, formValues, shouldSubmit]);

const handleSubmit = () => {
	setShouldSubmit(true);
};
```

**Correct (사용자 액션은 handler 안에서 바로 수행):**

```tsx
const handleSubmit = async () => {
	await createEntryMutation.mutateAsync(formValues);
};
```
