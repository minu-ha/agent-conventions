// [!code error]
// component/ui/ui-button/ui-button-button.tsx
// [!code error]
export const UiButtonButton = (props: UiButtonButtonProps) => {
	return <button type="button">{props.children}</button>;
};
