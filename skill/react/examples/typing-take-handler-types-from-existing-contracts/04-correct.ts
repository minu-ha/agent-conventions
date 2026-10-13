import type {UiButtonProps} from "@/component/ui/button/ui-button";

/**
 * 저장 버튼 클릭 기본 동작 차단
 */
const handleSubmitClick: UiButtonProps["onClick"] = (event) => {
	event.preventDefault();
};
