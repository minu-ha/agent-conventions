const toSortedUsers = (users: User[]): User[] => {
	return users.sort((left, right) => left.age - right.age);
};
