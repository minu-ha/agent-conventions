// component/widget/product-edit-toolbar/wg-product-edit-toolbar.tsx
import {WgProductToolbar} from "@/component/widget/product-toolbar/wg-product-toolbar";

export const WgProductEditToolbar = () => {
	return (
		<WgProductToolbar.Root>
			<WgProductEditActions />
		</WgProductToolbar.Root>
	);
};
