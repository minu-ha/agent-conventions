// test/orders/order-dialog.story.tsx
import { Fragment, useState } from "react";

import { WgOrderDialog } from "@/component/widget/order-dialog/wg-order-dialog";

/**
 * 저장 callback의 결과를 브라우저 DOM에 남기는 story
 */
export const SaveResult = () => {
	const [savedOrderId, setSavedOrderId] = useState("");

	return (
		<Fragment>
			{/**
			 * 브라우저 안에서 생성한 callback
			 */}
			<WgOrderDialog orderId="order-1" onSave={setSavedOrderId} />
			{/**
			 * 테스트에서 읽을 저장 결과
			 */}
			{/* [!code ++] */}
			<output data-testid="saved-order">{savedOrderId}</output>
		</Fragment>
	);
};
