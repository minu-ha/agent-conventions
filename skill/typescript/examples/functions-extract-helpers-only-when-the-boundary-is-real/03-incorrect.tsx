// page/profile/pg-profile.tsx
// [!code error]
// (previous + 1) % pageCount 한 줄을 page/profile/_function/get-next-page.ts로 옮김
// [!code error]
import {getNextPage} from "@/page/profile/_function/get-next-page";

const handleNextClick = () => {
// [!code error]
	setPage((previous) => getNextPage(previous, pageCount));
};
