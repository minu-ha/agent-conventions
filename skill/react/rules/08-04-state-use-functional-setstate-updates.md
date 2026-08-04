---
title: Use Functional setState Updates When Based on Previous State
titleKo: 이전 상태를 쓸 때는 함수형 `setState` 를 씁니다
impact: MEDIUM-HIGH
impactDescription: 다음 값이 현재 상태에 달려 있을 때 낡은 값을 붙잡는 버그를 막습니다
appliesWhen:
  - 다음 상태가 현재 상태에 의존하는 갱신을 추가·변경할 때
  - 핸들러·비동기 콜백·연속 호출에서 `setState` 방식을 바꿀 때
tags: state, setstate, closures, handlers
---

## Use Functional setState Updates When Based on Previous State

**Impact: MEDIUM-HIGH (다음 값이 현재 상태에 달려 있을 때 낡은 값을 붙잡는 버그를 막습니다)**

다음 상태가 현재 상태 값에 의존하면 직접 바깥 변수를 참조하지 말고 함수형 갱신자를 사용합니다.
특히 핸들러, 비동기 콜백, 여러 번 연속 호출될 수 있는 갱신에서는 낡은 값 붙잡기를 막는 데 중요합니다.

**Incorrect (현재 상태를 바깥 클로저에서 직접 읽음):**

```tsx
const handleToggleUser = (userId: string) => {
	if (selectedUserIds.includes(userId)) {
		setSelectedUserIds(selectedUserIds.filter((currentUserId) => currentUserId !== userId));
		return;
	}

	setSelectedUserIds([...selectedUserIds, userId]);
};
```

**Correct (함수형 갱신자로 항상 최신 상태를 기준으로 갱신):**

```tsx
/**
 * 사용자 선택 목록 토글 처리
 */
const handleToggleUser = (userId: string) => {
	setSelectedUserIds((currentUserIds) => {
		if (currentUserIds.includes(userId)) {
			return currentUserIds.filter((currentUserId) => currentUserId !== userId);
		}

		return [...currentUserIds, userId];
	});
};
```
