// [!code error]
import type {Ref} from "react";

// [!code error]
export interface UiStatusBadgeProps {
// [!code error]
	ref?: Ref<HTMLSpanElement>;
	label: string;
}

// [!code error]
export const UiStatusBadge = (props: UiStatusBadgeProps) => {
// [!code error]
	return <span ref={props.ref}>{props.label}</span>;
};
