import type {MouseEventHandler} from "react";

/**
 * 이미 고른 항목을 다시 누르면 선택 해제
 */
// [!code ++]
const handleListItemClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	toggleSelection();
};

/**
 * 폼 기본 제출 차단. 저장은 mutation 콜백이 이어서 처리
 */
// [!code ++]
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = (event) => {
	event.preventDefault();
};
