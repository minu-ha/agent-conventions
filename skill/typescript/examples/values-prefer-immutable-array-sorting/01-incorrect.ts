const toSortedUsers = (users: User[]): User[] => {
	return users.sort((left, right) => left.name.localeCompare(right.name));
};
