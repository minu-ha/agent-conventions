// component/ui/panel/ui-panel.tsx
import {UiPanelBody} from "@/component/ui/panel/_ui-panel-body";
import {UiPanelHeader} from "@/component/ui/panel/_ui-panel-header";
import {UiPanelRoot} from "@/component/ui/panel/_ui-panel-root";

// [!code ++]
// 단순 클래스 래퍼는 헤더 부품만 쓰고 여백 보정용 DOM은 안 만듦
export const UiPanel = {
	Root: UiPanelRoot,
	Header: UiPanelHeader,
	Body: UiPanelBody,
} as const;
