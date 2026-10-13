// component/widget/product-toolbar/wg-product-toolbar.tsx
import {WgProductToolbarRoot} from "@/component/widget/product-toolbar/_wg-product-toolbar-root";

// 조합은 두 변형이 이미 제공하므로 사용처가 직접 조립할 `Root`만 공개
export const WgProductToolbar = {
	Root: WgProductToolbarRoot,
} as const;
