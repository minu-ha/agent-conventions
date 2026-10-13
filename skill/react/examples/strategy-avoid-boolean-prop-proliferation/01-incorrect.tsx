// [!code error]
// component/widget/product-toolbar/wg-product-toolbar.tsx
// [!code error]
export interface WgProductToolbarProps {
// [!code error]
	isCompact?: boolean;
// [!code error]
	isEditing?: boolean;
// [!code error]
	showSearch?: boolean;
// [!code error]
}

// [!code error]
export const WgProductToolbar = (props: WgProductToolbarProps) => {
	return (
// [!code error]
		<header>
// [!code error]
			{props.showSearch && <WgProductSearchField />}
// [!code error]
			{props.isEditing ? (
// [!code error]
				<WgProductEditActions compact={props.isCompact} />
// [!code error]
			) : (
// [!code error]
				<WgProductBrowseActions compact={props.isCompact} />
// [!code error]
			)}
// [!code error]
		</header>
	);
};
