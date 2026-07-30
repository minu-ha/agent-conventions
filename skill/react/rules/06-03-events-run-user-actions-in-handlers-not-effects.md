---
title: Run User Actions in Handlers, Not Effects
titleKo: effect가 아닌 handler에서의 사용자 액션 실행
impact: HIGH
impactDescription: 한 번뿐인 사용자 액션을 state와 effect 재실행으로 모델링하는 것을 막습니다
appliesWhen:
  - 제출·저장·삭제·닫기 같은 one-shot 사용자 액션을 handler와 state+effect 사이에서 옮길 때
  - one-shot 사용자 액션의 실행 흐름을 바꿀 때
tags: events, handlers, effects, actions
---

## Run User Actions in Handlers, Not Effects

**Impact: HIGH (한 번뿐인 사용자 액션을 state와 effect 재실행으로 모델링하는 것을 막습니다)**

제출, 저장, 삭제, 닫기 같은 사용자 액션은 해당 handler 안에서 바로 실행합니다.
액션 자체를 state로 올린 뒤 `useEffect`가 나중에 실행하게 만들면 unrelated dependency 변화에도 재실행되기 쉽고,
흐름도 읽기 어려워집니다.

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
/**
 * @event 제출 버튼 클릭 시 생성 요청 실행
 */
const handleSubmit = async () => {
	await createEntryMutation.mutateAsync(formValues);
};
```
