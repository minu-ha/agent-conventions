// component/ui/panel/_ui-panel-root.tsx
import {clsx} from "clsx";

import type {UiPanelPartProps} from "@/component/ui/panel/_type/panel-part";

/**
 * 패널 틀. 나머지 부품은 이 안에서만 그림
 */
export const UiPanelRoot = (props: UiPanelPartProps) => {
	return <section className={clsx("ui_panel__root")}>{props.children}</section>;
};
