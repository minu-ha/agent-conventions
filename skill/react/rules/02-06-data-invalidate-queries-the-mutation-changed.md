---
title: Invalidate the Queries a Mutation Changed
titleKo: 뮤테이션이 바꾼 쿼리는 `invalidateQueries`로 다시 맞춥니다
impact: HIGH
impactDescription: 저장 뒤 화면이 옛 서버 상태를 계속 보여 주지 않습니다
appliesWhen:
  - 뮤테이션 성공 뒤 서버 상태를 다시 맞추는 코드를 추가·변경할 때
  - 캐시를 직접 쓰거나 다시 불러오는 코드를 넣을 때
reviewWith: data-handle-mutation-failure-where-it-is-called
tags: data, mutation
---

## Invalidate the Queries a Mutation Changed

**Impact: HIGH (저장 뒤 화면이 옛 서버 상태를 계속 보여 주지 않습니다)**

뮤테이션이 바꾼 서버 상태는 그 데이터를 소유한 쿼리 키로 `invalidateQueries`해서 다시 맞춥니다.

| 성공 뒤 서버 상태를 맞추는 방법 | 판정 |
| --- | --- |
| `invalidateQueries`로 바뀐 서버 상태를 다시 읽음 | 씁니다 |
| `setQueryData`로 응답을 목록에 손으로 고쳐 넣음 | 쓰지 않습니다. 서버가 할 계산을 화면이 대신해, 정렬이나 집계가 서버와 어긋나면 조용히 틀린 화면이 남습니다 |
| `refetch()`로 지금 화면만 다시 불러옴 | 쓰지 않습니다. 그 훅 하나만 다시 읽어서 같은 데이터를 보는 다른 화면은 옛 값을 그대로 갖습니다 |

다음 둘은 이 규칙의 대상이 아닙니다.

- 요청을 보내기 전에 화면을 먼저 움직이는 낙관적 갱신
- 사용자가 직접 누르는 새로 고침 버튼

무효화를 부르는 자리는 다음을 따릅니다.

- 쿼리 키 문자열을 화면에서 손으로 적지 않습니다.
  쿼리 훅이 내보낸 키를 씁니다.
- 무효화 대상이 여럿이면 성공 콜백에서 나란히 부릅니다.
- 무효화를 이펙트로 옮기지 않습니다.
  `events-run-user-actions-in-handlers-not-effects`가 그것을 막습니다.
- 어디서 부를지는 `data-handle-mutation-failure-where-it-is-called`가 정한 자리와 같습니다.

**Incorrect (캐시를 손으로 조립하고 키를 문자열로 적음):**

```tsx
const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: (saved) => {
			queryClient.setQueryData(["products"], (previous = []) => [...previous, saved]);
		},
	},
});
```

**Incorrect (그 훅만 다시 읽어 다른 화면이 옛 값을 유지):**

```tsx
const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: () => {
			void responseProductListSuspense.refetch();
		},
	},
});
```

**Correct (바뀐 데이터를 소유한 키를 무효화):**

```tsx
const queryClient = useQueryClient();

/**
 * 저장이 목록과 요약 집계를 함께 바꿔서 두 키를 나란히 무효화한다
 */
const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: () => {
			void queryClient.invalidateQueries({queryKey: productListQueryKey()});
			void queryClient.invalidateQueries({queryKey: productSummaryQueryKey()});
		},
	},
});
```
