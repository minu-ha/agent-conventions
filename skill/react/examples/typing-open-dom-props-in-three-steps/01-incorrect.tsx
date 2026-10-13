// [!code error]
// id, role, tabIndex, aria-*, 이벤트를 전부 잃고 다섯 개만 남음
// [!code error]
export interface UiButtonProps {
// [!code error]
	className?: string;
// [!code error]
	children?: ReactNode;
	color?: ButtonProps["color"];
// [!code error]
	disabled?: ButtonProps["disabled"];
// [!code error]
	onClick?: MouseEventHandler<HTMLButtonElement>;
}
