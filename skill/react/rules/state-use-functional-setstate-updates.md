---
title: Use Functional setState Updates When Based on Previous State
titleKo: 이전 state 기반 갱신의 함수형 setState 사용
impact: MEDIUM-HIGH
impactDescription: 다음 값이 현재 state에 의존할 때 stale closure 버그를 막습니다
appliesWhen:
  - 다음 state가 현재 state에 의존하는 갱신을 추가·변경할 때
  - handler·async callback·연속 호출에서 `setState` 방식을 바꿀 때
tags: state, setstate, closures, handlers
---

## Use Functional setState Updates When Based on Previous State

**Impact: MEDIUM-HIGH (다음 값이 현재 state에 의존할 때 stale closure 버그를 막습니다)**

다음 state가 현재 state 값에 의존하면 직접 바깥 변수를 참조하지 말고 functional updater를 사용합니다.
특히 handler, async callback, 여러 번 연속 호출될 수 있는 갱신에서는 stale closure를 막는 데 중요합니다.

**Incorrect (현재 state를 바깥 closure에서 직접 읽음):**

```tsx
const handleToggleUser = (userId: string) => {
	if (selectedUserIds.includes(userId)) {
		setSelectedUserIds(selectedUserIds.filter((currentUserId) => currentUserId !== userId));
		return;
	}

	setSelectedUserIds([...selectedUserIds, userId]);
};
```

**Correct (functional updater로 항상 최신 state를 기준으로 갱신):**

```tsx
/**
 * @event 사용자 선택 목록 토글 처리
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
