// [!code ++]
// component/widget/product-browse-toolbar/wg-product-browse-toolbar.tsx
// [!code ++]
import {WgProductToolbar} from "@/component/widget/product-toolbar/wg-product-toolbar";

// [!code ++]
export const WgProductBrowseToolbar = () => {
	return (
// [!code ++]
		<WgProductToolbar.Root>
// [!code ++]
			<WgProductSearchField />
// [!code ++]
			<WgProductBrowseActions />
// [!code ++]
		</WgProductToolbar.Root>
	);
};
