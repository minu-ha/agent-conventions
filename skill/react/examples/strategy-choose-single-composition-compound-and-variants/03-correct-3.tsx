// component/widget/profile-dialog/_wg-profile-dialog-root.tsx
import {clsx} from "clsx";

import type {WgProfileDialogPartProps} from "@/component/widget/profile-dialog/_type/profile-dialog-part";

/**
 * 대화상자 틀. 나머지 부품은 이 안에서만 그림
 */
export const WgProfileDialogRoot = (props: WgProfileDialogPartProps) => {
	return <section className={clsx("wg_profileDialog__root")}>{props.children}</section>;
};
