// component/ui/panel/ui-panel.tsx
import {UiPanelBody} from "@/component/ui/panel/_ui-panel-body";
import {UiPanelHeader} from "@/component/ui/panel/_ui-panel-header";
// [!code error]
import {UiPanelHeaderInner} from "@/component/ui/panel/_ui-panel-header-inner";
import {UiPanelRoot} from "@/component/ui/panel/_ui-panel-root";
// [!code error]
import {UiPanelSpacer} from "@/component/ui/panel/_ui-panel-spacer";

// [!code error]
// 사용처가 끼워 넣을 자리가 없는 래퍼와 여백 보정용 DOM까지 이름이 붙어 노출
export const UiPanel = {
	Root: UiPanelRoot,
	Header: UiPanelHeader,
// [!code error]
	HeaderInner: UiPanelHeaderInner,
// [!code error]
	Spacer: UiPanelSpacer,
	Body: UiPanelBody,
} as const;
