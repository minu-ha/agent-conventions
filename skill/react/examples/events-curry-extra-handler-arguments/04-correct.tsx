// [!code ++]
import type {MouseEventHandler} from "react";

// [!code ++]
/**
// [!code ++]
 * 클릭한 항목을 이벤트 대신 팩토리 인자로 받아 어느 상품인지 식별
// [!code ++]
 */
// [!code ++]
const handleListItemClick =
// [!code ++]
	(productId: string): MouseEventHandler<HTMLButtonElement> =>
// [!code ++]
	(_event) => {
		toggleSelection(productId);
	};
