// component/widget/product-toolbar/wg-product-toolbar.tsx
export interface WgProductToolbarProps {
	isCompact?: boolean;
	isEditing?: boolean;
	showSearch?: boolean;
}

export const WgProductToolbar = (props: WgProductToolbarProps) => {
	return (
		<header>
			{props.showSearch && <WgProductSearchField />}
			{props.isEditing ? (
				<WgProductEditActions compact={props.isCompact} />
			) : (
				<WgProductBrowseActions compact={props.isCompact} />
			)}
		</header>
	);
};
