import {sortBy} from "es-toolkit";

const toSortedUsers = (users: readonly User[]): User[] => {
	return sortBy(users, ["age"]);
};
