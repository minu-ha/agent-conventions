export const toSortedUserIds = (userIds: string[]): string[] => {
	return sortBy(uniq(userIds), [(userId) => userId]);
};
