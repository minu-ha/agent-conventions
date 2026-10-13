// [!code ++]
import {sortBy} from "es-toolkit";

// [!code ++]
const toSortedUsers = (users: readonly User[]): User[] => {
// [!code ++]
	return sortBy(users, ["age"]);
};
