export interface UiButtonProps {
	variant?: ButtonProps["variant"];
	className?: string;
}

export const UiButton = (props: UiButtonProps) => {
// [!code ++]
	return <Button className={clsx("ui_button__root", props.className)} variant={props.variant} />;
};
