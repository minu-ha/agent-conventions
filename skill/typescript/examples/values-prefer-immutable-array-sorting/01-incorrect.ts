// [!code error]
const toSortedUsers = (users: User[]): User[] => {
// [!code error]
	return users.sort((left, right) => left.age - right.age);
};
