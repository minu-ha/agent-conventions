---
title: Run User Actions in Handlers, Not Effects
titleKo: 사용자 액션은 이펙트가 아니라 핸들러에서 실행합니다
impact: HIGH
impactDescription: 한 번뿐인 동작을 상태와 이펙트 재실행으로 대신하지 않습니다
appliesWhen:
  - 제출, 저장, 삭제, 닫기 같은 한 번뿐인 사용자 액션을 핸들러와 상태+이펙트 사이에서 옮길 때
  - 이펙트 안에서 뮤테이션이나 화면 이동을 호출하는 코드를 넣을 때
tags: events, handlers, effects
---

## Run User Actions in Handlers, Not Effects

**Impact: HIGH (한 번뿐인 동작을 상태와 이펙트 재실행으로 대신하지 않습니다)**

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

	mutationProductCreate.mutate({data: toProductCreateRequest(formValues)});
}, [mutationProductCreate, formValues, shouldSubmit]);

const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	setShouldSubmit(true);
};
```

**Correct (사용자 액션은 핸들러 안에서 바로 수행):**

```tsx
/**
 * 생성에 성공하면 목록으로 돌아간다. 이 흐름은 화면 이동까지 한 번에 끝난다
 */
const mutationProductCreate = useProductCreate({
	mutation: {
		onSuccess: () => {
			void navigate({to: "/products"});
		},
	},
});

/**
 * 버튼을 누른 그 자리에서 생성을 부른다. 상태로 올려 이펙트가 대신 부르게 하지 않는다
 */
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	mutationProductCreate.mutate({data: toProductCreateRequest(formValues)});
};
```
