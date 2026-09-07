---
title: Invalidate the Queries a Mutation Changed
titleKo: 뮤테이션이 바꾼 쿼리는 `invalidateQueries`로 다시 맞춥니다
impact: HIGH
impactDescription: 저장으로 바뀐 서버 상태를 관련 쿼리에 반영합니다
appliesWhen:
  - 뮤테이션 성공 뒤 서버 상태를 다시 맞추는 코드를 추가·변경할 때
  - 저장 결과를 캐시에 직접 쓰거나 `refetch`로 맞추는 코드를 넣을 때
  - 제외: 사용자 새로 고침 버튼이나 요청 전 낙관적 갱신만 바꾸는 경우
reviewWith: data-handle-mutation-failure-where-it-is-called
tags: data, mutation
---

## Invalidate the Queries a Mutation Changed

**Impact: HIGH (저장으로 바뀐 서버 상태를 관련 쿼리에 반영합니다)**

뮤테이션이 바꾼 서버 상태는 해당 데이터를 소유한 쿼리 키로 `invalidateQueries`하여 다시 맞춥니다.
낙관적 갱신과 사용자가 누르는 새로 고침 버튼은 이 규칙의 대상이 아닙니다.

| 성공 뒤 갱신 방법 | 판정 |
| --- | --- |
| `invalidateQueries` | 변경된 서버 상태를 가리키는 관련 키들을 함께 지정합니다 |
| `setQueryData`로 응답을 목록에 직접 반영 | 쓰지 않습니다. 화면에서 대신 계산한 정렬·집계가 서버와 어긋날 수 있습니다 |
| 현재 키의 `refetch()` | 관련 키 전체를 맞추는 수단으로 쓰지 않습니다. 다른 필터·페이지 키와 요약 쿼리는 남습니다 |

같은 `QueryClient`의 같은 키를 구독하면 `refetch()` 결과도 함께 받습니다.
무효화를 고르는 기준은 구독자 수가 아니라 관련 키의 범위입니다.
`invalidateQueries`는 일치하는 쿼리를 오래된 상태로 표시하고 기본적으로 활성 쿼리를 다시 불러옵니다.
비활성 쿼리까지 즉시 요청한다고 가정하지 않습니다.

| 호출 조건 | 처리 |
| --- | --- |
| 쿼리 키 지정 | 문자열을 직접 적지 않고 쿼리 훅이 내보낸 키를 씁니다 |
| 무효화 대상이 여럿임 | 성공 콜백에서 나란히 호출합니다 |
| 다시 읽기를 마쳐야 저장 중 표시나 후속 동작을 끝낼 수 있음 | 성공 콜백에서 무효화 Promise를 반환하거나 `await`합니다 |
| 호출 위치 | `data-handle-mutation-failure-where-it-is-called`를 따릅니다. `events-run-user-actions-in-handlers-not-effects`에 따라 이펙트로 옮기지 않습니다 |

**Incorrect (캐시를 손으로 조립하고 키를 문자열로 적습니다):**

```tsx
const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: (saved) => {
			queryClient.setQueryData(["products"], (previous = []) => [...previous, saved]);
		},
	},
});
```

**Incorrect (현재 목록 키만 다시 읽어 다른 목록 조건과 요약 키를 놓칩니다):**

```tsx
const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: () => {
			void responseProductListSuspense.refetch();
		},
	},
});
```

**Correct (바뀐 데이터를 소유한 키를 무효화합니다):**

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
