const toSortedUsers = (users: readonly User[]): User[] => {
	return users.toSorted((left, right) => left.name.localeCompare(right.name));
};
