/**
 * 라벨과 보조 설명을 붙인 입력 한 줄
 */
export interface UiFieldProps {
	/**
	 * 최상위에 얹을 클래스
	 */
	className?: string;
	/**
	 * 입력 위에 붙는 라벨
	 */
	label: string;
	/**
	 * 입력 아래 보조 설명
	 */
	helperText?: string;
	/**
	 * 라벨과 입력을 잇는 id
	 */
	inputId: string;
	/**
	 * 입력값
	 */
	value: string;
	/**
	 * 입력이 바뀔 때
	 */
	onChange: ChangeEventHandler<HTMLInputElement>;
}

export const UiField = (props: UiFieldProps) => {
	return (
		<div className={clsx("ui_field__root", props.className)}>
			<label className={clsx("ui_field__label")} htmlFor={props.inputId}>
				{props.label}
			</label>
			<input id={props.inputId} value={props.value} onChange={props.onChange} />
			{props.helperText && <span className={clsx("ui_field__helper")}>{props.helperText}</span>}
		</div>
	);
};
