/**
 * 새 참여자가 들어오면 선택 목록에 추가
 */
useEffect(() => {
	return subscribeToUserJoined((joinedUserId) => {
// [!code ++]
		setSelectedUserIds((currentUserIds) => [...currentUserIds, joinedUserId]);
	});
}, []);
