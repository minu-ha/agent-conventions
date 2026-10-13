export interface UiCollapseProps {
	className?: string;
	children: ReactNode;
}

export const UiCollapse = (props: UiCollapseProps) => {
	return (
		<div className={clsx("ui_collapse__root", props.className)}>{props.children}</div>
	);
};
