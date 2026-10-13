// component/widget/product-browse-toolbar/wg-product-browse-toolbar.tsx
import {WgProductToolbar} from "@/component/widget/product-toolbar/wg-product-toolbar";

export const WgProductBrowseToolbar = () => {
	return (
		<WgProductToolbar.Root>
			<WgProductSearchField />
			<WgProductBrowseActions />
		</WgProductToolbar.Root>
	);
};
