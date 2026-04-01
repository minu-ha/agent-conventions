---
title: Store Shared Role and Authority Decisions Once
impact: HIGH
impactDescription: prevents duplicated authorization heuristics from spreading across screens
tags: state, zustand, authority
---

## Store Shared Role and Authority Decisions Once

**Impact: HIGH (prevents duplicated authorization heuristics from spreading across screens)**

역할, 권한, 공용 판별 결과는 스토어에 한 번 적재하고 화면에서는 그 결과만 참조합니다. 화면마다 문자열 비교나 유틸 호출로 다시 계산하지 않고, 스토어 접근도 구조분해보다 원본 객체 체이닝을 우선합니다. Suspense query처럼 `onSuccess`가 없으면 `useEffect` 또는 `useLayoutEffect`에서 동기화하고, selector 최적화는 정말 필요한 경우에만 근거 주석과 함께 예외적으로 사용합니다.

**Incorrect (화면마다 판별을 반복하고 구조분해로 오리진을 잃음):**

```ts
const isSuperAdmin = isSuperAdminRoleName(roleName);
const { isEditor } = useRoleStore();
```

**Correct (공용 판별 결과를 스토어에서 한 번 참조):**

```ts
const roleStore = useRoleStore();

if (roleStore.isSuperAdmin) {
  // ...
}
```

```ts
useEffect(() => {
  if (!responseRoleGetItemSuspense.data) {
    return;
  }

  roleStore.setRole(responseRoleGetItemSuspense.data.role);
}, [responseRoleGetItemSuspense.data, roleStore]);
```
