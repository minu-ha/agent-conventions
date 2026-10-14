// [!code error]
export type UiButtonProps = ButtonProps;

export const UiButton = (props: UiButtonProps) => {
	return <Button {...props} />;
};
