export interface UiButtonProps {
	variant?: ButtonProps["variant"];
	className?: string;
}

export const UiButton = (props: UiButtonProps) => {
// [!code error]
	return <Button className={clsx("ui_button__root", `ui_button__root--${props.variant}`, props.className)} />;
};
