// [!code error]
export interface UiIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	icon: ReactNode;
}

// [!code error]
// 안쪽 컴포넌트가 거르지 않으면 icon이 DOM까지 내려감. 컴파일은 통과
export const UiIconButton = (props: UiIconButtonProps) => {
	return (
// [!code error]
		<Button {...props}>
			{props.icon}
// [!code error]
			{props.children}
		</Button>
	);
};
