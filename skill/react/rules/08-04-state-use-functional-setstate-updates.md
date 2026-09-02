---
title: Use Functional setState Updates When Based on Previous State
titleKo: 이전 상태에 기대는 갱신은 함수형 `setState`로 씁니다
impact: HIGH
impactDescription: 다음 값이 현재 상태에 달려 있을 때 낡은 값을 붙잡는 버그를 막습니다
appliesWhen:
  - 다음 상태가 현재 상태에 의존하는 갱신을 추가·변경할 때
  - 핸들러·비동기 콜백·연속 호출에서 `setState` 방식을 바꿀 때
tags: state, handlers
---

## Use Functional setState Updates When Based on Previous State

**Impact: HIGH (다음 값이 현재 상태에 달려 있을 때 낡은 값을 붙잡는 버그를 막습니다)**

다음 상태가 현재 상태 값에 의존하면 바깥 변수를 직접 읽지 않고 함수형 업데이터를 씁니다.

한 이벤트 안에서 두 번 갱신하거나, `await` 뒤나 오래 사는 클로저 안에서 갱신하면 결과가 갈립니다.
한 번만 부르는 갱신은 두 형태가 같은 결과를 내지만, 형태를 하나로 고정해 자리마다 다시 판단하지 않습니다.

**Incorrect (오래 사는 콜백이 등록 시점의 상태를 붙잡습니다):**

```tsx
/**
 * 새 참여자가 들어오면 선택 목록에 더한다
 */
useEffect(() => {
	// 콜백은 등록 시점의 selectedUserIds 를 붙잡는다. 나중에 도착한 참여자가 옛 목록에 더해져 그사이 고른 항목이 지워진다
	return subscribeToUserJoined((joinedUserId) => {
		setSelectedUserIds([...selectedUserIds, joinedUserId]);
	});
}, []);
```

**Correct (함수형 업데이터로 항상 최신 상태를 기준으로 갱신합니다):**

```tsx
/**
 * 새 참여자가 들어오면 선택 목록에 더한다
 */
useEffect(() => {
	return subscribeToUserJoined((joinedUserId) => {
		setSelectedUserIds((currentUserIds) => [...currentUserIds, joinedUserId]);
	});
}, []);
```
