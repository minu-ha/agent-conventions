export interface UiTooltipProps {
	variant?: "fit" | "plain";
	children: ReactNode;
}

export const UiTooltip = (props: UiTooltipProps) => {
	return (
// [!code ++]
		<div
// [!code ++]
			className={clsx(
// [!code ++]
				"ui_tooltip__body",
// [!code ++]
				props.variant === "fit" && "ui_tooltip__body--fit",
// [!code ++]
				props.variant === "plain" && "ui_tooltip__body--plain",
// [!code ++]
			)}
// [!code ++]
		>
			{props.children}
		</div>
	);
};
