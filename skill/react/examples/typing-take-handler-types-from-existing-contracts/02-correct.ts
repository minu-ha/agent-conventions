import type {MouseEventHandler} from "react";

/**
 * 행 id를 커링으로 고정. 목록 JSX에 인라인 래퍼를 두지 않음
 */
const handleRowSelectToggle =
	(rowId: string): MouseEventHandler<HTMLButtonElement> =>
	(event) => {
		event.preventDefault();
		toggleSelection(rowId);
	};
