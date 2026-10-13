// [!code ++]
import type {MouseEventHandler} from "react";

// [!code ++]
/**
// [!code ++]
 * 행 id를 커링으로 고정. 목록 JSX에 인라인 래퍼를 두지 않음
// [!code ++]
 */
// [!code ++]
const handleRowSelectToggle =
// [!code ++]
	(rowId: string): MouseEventHandler<HTMLButtonElement> =>
// [!code ++]
	(event) => {
		event.preventDefault();
		toggleSelection(rowId);
	};
