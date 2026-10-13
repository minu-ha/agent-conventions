import {TextField} from "@mui/material";
import type {TextFieldProps} from "@mui/material";
import {clsx} from "clsx";
import type {ChangeEventHandler} from "react";

/**
 * 라벨과 값을 받는 한 줄 입력 계약
 *
 * 겉은 `div`, 이벤트는 안쪽 `input`이 받아 요소 전용 타입을 그대로 못 씀
 * 입력 이름을 반드시 보이려고 label은 선택적인 ReactNode 대신 필수 문자열
 */
export interface UiTextFieldProps {
	/**
	 * 입력 위에 보이는 이름
	 */
	label: string;
	/**
	 * 최상위에 얹을 클래스
	 */
	className?: string;
	/**
	 * 입력 식별자
	 */
	id?: string;
	/**
	 * 입력값
	 */
	value: string;
	/**
	 * 입력이 바뀔 때
	 */
	onChange: ChangeEventHandler<HTMLInputElement>;
	/**
	 * 오류 표시 여부
	 */
	error?: TextFieldProps["error"];
}

export const UiTextField = (props: UiTextFieldProps) => {
	return (
		<TextField
			className={clsx("ui_textField__root", props.className)}
			id={props.id}
			label={props.label}
			value={props.value}
			onChange={props.onChange}
			error={props.error}
		/>
	);
};
