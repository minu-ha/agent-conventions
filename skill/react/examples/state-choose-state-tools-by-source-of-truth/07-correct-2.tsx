// component/ui/tabs/_ui-tabs-root.tsx
import {UiTabsContext} from "@/component/ui/tabs/_hook/use-tabs";

/**
 * 탭 묶음 루트 입력 계약
 */
export interface UiTabsRootProps {
	/**
	 * 처음 열어 둘 탭 식별자
	 */
	defaultId: string;
	/**
	 * 탭 목록과 패널 부품
	 */
	children: ReactNode;
}

export const UiTabsRoot = (props: UiTabsRootProps) => {
	const [selectedId, setSelectedId] = useState(props.defaultId);

	return <UiTabsContext value={{ selectedId, onSelect: setSelectedId }}>{props.children}</UiTabsContext>;
};
