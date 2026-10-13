// [!code ++]
/**
// [!code ++]
 * 아이콘만 있는 버튼
// [!code ++]
 *
// [!code ++]
 * `icon`과 `label`은 안쪽 컴포넌트가 모르는 자기 프롭이라 타입을 직접 선언
// [!code ++]
 * `disabled`는 라이브러리에 이미 있어 인덱스 접근으로 가져옴
// [!code ++]
 */
// [!code ++]
export interface UiIconButtonProps {
// [!code ++]
	/**
// [!code ++]
	 * 최상위에 얹을 클래스
// [!code ++]
	 */
// [!code ++]
	className?: string;
// [!code ++]
	/**
// [!code ++]
	 * 버튼 안에 그릴 아이콘
// [!code ++]
	 */
	icon: ReactNode;
// [!code ++]
	/**
// [!code ++]
	 * 스크린 리더가 읽을 이름. `aria-label`로 전달
// [!code ++]
	 */
// [!code ++]
	label: string;
// [!code ++]
	/**
// [!code ++]
	 * 비활성 여부
// [!code ++]
	 */
// [!code ++]
	disabled?: ButtonProps["disabled"];
// [!code ++]
	/**
// [!code ++]
	 * 눌렀을 때
// [!code ++]
	 */
// [!code ++]
	onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const UiIconButton = (props: UiIconButtonProps) => {
	return (
// [!code ++]
		<Button
// [!code ++]
			className={clsx("ui_iconButton__root", props.className)}
// [!code ++]
			aria-label={props.label}
// [!code ++]
			disabled={props.disabled}
// [!code ++]
			onClick={props.onClick}
// [!code ++]
		>
			{props.icon}
		</Button>
	);
};
