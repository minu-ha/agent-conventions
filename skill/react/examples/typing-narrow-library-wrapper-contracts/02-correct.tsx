import {Button} from "@mui/material";
import type {ButtonProps} from "@mui/material";
import type {MouseEventHandler, ReactNode} from "react";

/**
 * 버튼 래퍼 계약
 *
 * sx, classes, component 같은 스타일 주입 지점은 열지 않음
 */
export interface UiButtonProps {
	children: ReactNode;
	/**
	 * 강조 수준
	 */
	variant?: ButtonProps["variant"];
	/**
	 * 크기
	 */
	size?: ButtonProps["size"];
	/**
	 * 요청이 끝날 때까지 눌리지 않음
	 */
	isLoading?: boolean;
	onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const UiButton = (props: UiButtonProps) => {
	return (
		<Button variant={props.variant} size={props.size} disabled={props.isLoading} onClick={props.onClick}>
			{props.children}
		</Button>
	);
};
