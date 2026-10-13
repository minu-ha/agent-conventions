import {Button} from "@mui/material";
import type {ButtonProps} from "@mui/material";
import {clsx} from "clsx";
import type {ButtonHTMLAttributes} from "react";

/**
 * 라이브러리 버튼의 강조 단계를 여는 계약
 *
 * color의 문자열 리터럴은 DOM의 string에 할당 가능해 Omit 불필요
 */
export interface UiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/**
	 * 강조 단계
	 */
	color?: ButtonProps["color"];
}

export const UiButton = (props: UiButtonProps) => {
	return <Button {...props} className={clsx("ui_button__root", props.className)} />;
};
