// [!code ++]
import type {MouseEventHandler} from "react";

// [!code ++]
/**
// [!code ++]
 * 선택된 상품 삭제. 성공 뒤 이동은 mutation 콜백이 이어 감
// [!code ++]
 */
// [!code ++]
const handleRemoveProductButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	if (!selectedProduct) {
		return;
	}

	mutationProductRemove.mutate({params: {productId: selectedProduct.id}});
// [!code ++]
};

// [!code ++]
<UiButton onClick={handleRemoveProductButtonClick}>삭제</UiButton>;
