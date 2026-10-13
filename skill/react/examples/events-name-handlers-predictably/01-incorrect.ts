import type {MouseEventHandler} from "react";

// [!code error]
// 목록 항목과 저장 버튼 둘 다 클릭을 받는데 이름에 대상이 없어 뒤에 번호가 붙음
/**
 * 이미 고른 항목을 다시 누르면 선택 해제
 */
// [!code error]
const onClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	toggleSelection();
};

/**
 * 폼 기본 제출 차단. 저장은 mutation 콜백이 이어서 처리
 */
// [!code error]
const onClick2: MouseEventHandler<HTMLButtonElement> = (event) => {
	event.preventDefault();
};
