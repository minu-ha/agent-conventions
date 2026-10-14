export const toSortedUserIds = (userIds: string[]): string[] => {
	return uniq(userIds).toSorted();
};
