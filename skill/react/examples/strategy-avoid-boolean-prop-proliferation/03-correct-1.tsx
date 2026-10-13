// component/widget/product-toolbar/_wg-product-toolbar-root.tsx
/**
 * 툴바 바깥 틀 부품
 */
export interface WgProductToolbarRootProps {
	/**
	 * 툴바 줄에 늘어놓을 검색과 동작 부품
	 */
	children: ReactNode;
}

export const WgProductToolbarRoot = (props: WgProductToolbarRootProps) => {
	return <header className={clsx("wg_productToolbar__root")}>{props.children}</header>;
};
