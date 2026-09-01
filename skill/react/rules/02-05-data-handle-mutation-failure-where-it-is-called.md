---
title: Handle Mutation Failure Where the Mutation Is Called
titleKo: 뮤테이션 실패는 부른 자리에서 받습니다
impact: HIGH
impactDescription: 저장이 실패했는데 성공한 것처럼 넘어가거나 아무 표시 없이 끝나지 않습니다
appliesWhen:
  - 뮤테이션을 부르는 코드를 추가·변경할 때
  - `mutate`와 `mutateAsync` 사이를 오갈 때
reviewWith: >-
  data-invalidate-queries-the-mutation-changed,
  events-run-user-actions-in-handlers-not-effects
tags: data, mutation, errors
---

## Handle Mutation Failure Where the Mutation Is Called

**Impact: HIGH (저장이 실패했는데 성공한 것처럼 넘어가거나 아무 표시 없이 끝나지 않습니다)**

뮤테이션 실패는 오류 경계가 받지 못합니다.
핸들러 안에서 난 오류는 렌더 중에 난 것이 아니어서 경계를 그냥 지나칩니다.
`runtime-place-error-boundaries-by-blast-radius`가 그 경계를 정하고, 여기서는 그 밖의 자리를 봅니다.

**기본은 `mutate`와 `useMutation`의 `onError`·`onSuccess`입니다.**
성공과 실패가 선언 자리에 함께 남고 핸들러는 부르기만 합니다.

| 상황 | 쓰는 것 |
| --- | --- |
| 부른 뒤 핸들러가 더 할 일이 없음 | `mutate` + `onError`·`onSuccess` |
| 부른 결과를 기다렸다가 핸들러가 이어서 해야 함 | `mutateAsync` + `try`/`catch` |

`mutateAsync`는 실패하면 던집니다.
`await`만 하고 `catch`하지 않으면 그 뒤 줄이 실행되지 않고 사용자에게 아무 표시도 남지 않습니다.
`mutateAsync`를 쓰기로 했으면 `try`/`catch`를 같이 씁니다.

- 한 뮤테이션을 부르는 자리들끼리는 형태를 섞지 않습니다.
  같은 저장을 어떤 자리에서는 `mutate`로, 어떤 자리에서는 `mutateAsync`로 부르면 실패를 어디서 받는지 다시 찾게 됩니다.
- 빈 `catch`로 실패를 삼키지 않습니다.
  다시 던지든 표시하든 무엇이든 합니다.
- 여러 번 눌러 같은 뮤테이션이 겹치는 것은 버튼을 `isPending`으로 `disabled` 처리해 막고,
  핸들러 첫 줄에서 `isPending` 이른 반환으로 한 번 더 막습니다.
- 성공 뒤 캐시를 다시 맞추는 것은 `data-invalidate-queries-the-mutation-changed`가 정합니다.

실패했을 때 무엇을 보여 줄지는 이 규칙이 정하지 않습니다.
제품마다 다르고 코드로 판정할 수 없습니다.

**Incorrect (`await`만 하고 실패를 받지 않음):**

```tsx
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
	await mutationProductSave.mutateAsync({data: toProductSaveRequest(formValues)});
	void navigate("/products");
};
```

**Correct (핸들러가 더 할 일이 없어 콜백으로 받음):**

```tsx
const queryClient = useQueryClient();

/**
 * 저장에 성공하면 목록을 다시 읽고 목록 화면으로 돌아간다. 실패 문구는 폼 위에 남긴다
 */
const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: () => {
			void queryClient.invalidateQueries({queryKey: productListQueryKey()});
			void navigate("/products");
		},
		onError: (error) => {
			setSubmitErrorMessage(toSubmitErrorMessage(error));
		},
	},
});

/**
 * 버튼 disabled와 별개로 겹쳐 들어온 저장을 한 번 더 막는다
 */
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	if (mutationProductSave.isPending) {
		return;
	}

	mutationProductSave.mutate({data: toProductSaveRequest(formValues)});
};
```

```tsx
<UiButton disabled={mutationProductSave.isPending} onClick={handleSaveButtonClick}>
	저장
</UiButton>;
```

**Correct (결과를 기다려 이어서 해야 해서 `try`/`catch`):**

```tsx
/**
 * 첨부를 먼저 올린 뒤 그 식별자로 product를 저장한다
 */
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
	if (mutationAttachmentUpload.isPending) {
		return;
	}

	try {
		const uploaded = await mutationAttachmentUpload.mutateAsync({files: draftFiles});

		await mutationProductSave.mutateAsync({
			data: toProductSaveRequest(formValues, uploaded.attachmentIds),
		});

		void navigate("/products");
	} catch (error) {
		setSubmitErrorMessage(toSubmitErrorMessage(error));
	}
};
```
