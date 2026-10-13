// [!code ++]
import type {UiButtonProps} from "@/component/ui/button/ui-button";

// [!code ++]
/**
// [!code ++]
 * 저장 버튼 클릭 기본 동작 차단
// [!code ++]
 */
// [!code ++]
const handleSubmitClick: UiButtonProps["onClick"] = (event) => {
	event.preventDefault();
};
