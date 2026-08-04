---
title: Run User Actions in Handlers, Not Effects
titleKo: 사용자 동작은 이펙트가 아니라 핸들러에서 실행합니다
impact: HIGH
impactDescription: 한 번뿐인 동작을 상태와 이펙트 재실행으로 흉내 내지 않습니다
appliesWhen:
  - 제출·저장·삭제·닫기 같은 한 번뿐인 사용자 액션을 핸들러와 상태+이펙트 사이에서 옮길 때
  - 한 번뿐인 사용자 액션의 실행 흐름을 바꿀 때
tags: events, handlers, effects, actions
---

## Run User Actions in Handlers, Not Effects

**Impact: HIGH (한 번뿐인 동작을 상태와 이펙트 재실행으로 흉내 내지 않습니다)**

제출, 저장, 삭제, 닫기 같은 사용자 액션은 해당 핸들러 안에서 바로 실행합니다.
액션 자체를 상태로 올린 뒤 `useEffect`가 나중에 실행하게 만들면 무관한 의존성 변화에도 재실행되기 쉽고,
흐름도 읽기 어려워집니다.

**Incorrect (사용자 액션을 상태 + 이펙트로 모델링):**

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

**Correct (사용자 액션은 핸들러 안에서 바로 수행):**

```tsx
/**
 * 제출 버튼 클릭 시 생성 요청 실행
 */
const handleSubmit = async () => {
	await createEntryMutation.mutateAsync(formValues);
};
```
