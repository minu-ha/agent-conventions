export const UiCollapse = (props: UiCollapseProps) => {
	return (
// [!code error]
		<div className={clsx("ui_collapse__root")}>
// [!code error]
			<button className={clsx("ui_collapse__header", props.className)} type="button">
				{props.title}
			</button>
			<div className={clsx("ui_collapse__content")}>{props.children}</div>
		</div>
	);
};
