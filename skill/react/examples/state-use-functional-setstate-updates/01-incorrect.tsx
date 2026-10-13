/**
 * 새 참여자가 들어오면 선택 목록에 추가
 */
useEffect(() => {
// [!code error]
	// 콜백은 등록 시점의 selectedUserIds를 붙잡음. 나중에 도착한 참여자가 옛 목록에 더해져 그사이 고른 항목이 지워짐
	return subscribeToUserJoined((joinedUserId) => {
// [!code error]
		setSelectedUserIds([...selectedUserIds, joinedUserId]);
	});
}, []);
