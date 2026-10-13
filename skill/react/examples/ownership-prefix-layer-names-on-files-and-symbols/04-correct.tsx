// [!code ++]
// component/ui/button/ui-button.tsx
// [!code ++]
export const UiButton = (props: UiButtonProps) => {
	return <button type="button">{props.children}</button>;
};
