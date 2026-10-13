/**
 * 아이콘만 있는 버튼
 *
 * `icon`과 `label`은 안쪽 컴포넌트가 모르는 자기 프롭이라 타입을 직접 선언
 * `disabled`는 라이브러리에 이미 있어 인덱스 접근으로 가져옴
 */
export interface UiIconButtonProps {
	/**
	 * 최상위에 얹을 클래스
	 */
	className?: string;
	/**
	 * 버튼 안에 그릴 아이콘
	 */
	icon: ReactNode;
	/**
	 * 스크린 리더가 읽을 이름. `aria-label`로 전달
	 */
	label: string;
	/**
	 * 비활성 여부
	 */
	disabled?: ButtonProps["disabled"];
	/**
	 * 눌렀을 때
	 */
	onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const UiIconButton = (props: UiIconButtonProps) => {
	return (
		<Button
			className={clsx("ui_iconButton__root", props.className)}
			aria-label={props.label}
			disabled={props.disabled}
			onClick={props.onClick}
		>
			{props.icon}
		</Button>
	);
};
