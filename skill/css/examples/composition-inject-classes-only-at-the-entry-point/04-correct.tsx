export const UiCollapse = (props: UiCollapseProps) => {
// [!code ++]
	const isCompact = props.variant === "compact";

	return (
// [!code ++]
		<div className={clsx("ui_collapse__root", props.className)}>
// [!code ++]
			<button className={clsx("ui_collapse__header", isCompact && "ui_collapse__header--compact")} type="button">
// [!code ++]
				<span className={clsx("ui_collapse__title", isCompact && "ui_collapse__title--compact")}>{props.title}</span>
			</button>
			<div className={clsx("ui_collapse__content")}>{props.children}</div>
		</div>
	);
};
