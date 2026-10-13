// id, role, tabIndex, aria-*, 이벤트를 전부 잃고 다섯 개만 남음
export interface UiButtonProps {
	className?: string;
	children?: ReactNode;
	color?: ButtonProps["color"];
	disabled?: ButtonProps["disabled"];
	onClick?: MouseEventHandler<HTMLButtonElement>;
}
