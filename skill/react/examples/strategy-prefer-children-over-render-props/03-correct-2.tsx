// component/ui/panel/ui-panel.tsx
import {UiPanelFooter} from "@/component/ui/panel/_ui-panel-footer";
import {UiPanelHeader} from "@/component/ui/panel/_ui-panel-header";
import {UiPanelRoot} from "@/component/ui/panel/_ui-panel-root";

// Header와 Footer도 Root와 같은 형태로 children만 받음
export const UiPanel = {
	Root: UiPanelRoot,
	Header: UiPanelHeader,
	Footer: UiPanelFooter,
} as const;
