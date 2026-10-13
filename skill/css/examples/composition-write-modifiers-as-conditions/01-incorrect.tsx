export interface UiTooltipProps {
	variant?: "fit" | "plain";
	children: ReactNode;
}

export const UiTooltip = (props: UiTooltipProps) => {
	return (
// [!code error]
		<div className={clsx("ui_tooltip__body", props.variant && `ui_tooltip__body--${props.variant}`)}>
			{props.children}
		</div>
	);
};
