import type {MouseEventHandler} from "react";

/**
 * 클릭한 항목을 이벤트 대신 팩토리 인자로 받아 어느 상품인지 식별
 */
const handleListItemClick =
	(productId: string): MouseEventHandler<HTMLButtonElement> =>
	(_event) => {
		toggleSelection(productId);
	};
