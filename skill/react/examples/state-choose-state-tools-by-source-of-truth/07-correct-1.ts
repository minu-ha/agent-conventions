// component/ui/tabs/_hook/use-tabs.ts
/**
 * 탭 부품끼리 나눠 쓰는 값
 */
interface UiTabsContextValue {
	/**
	 * 지금 열린 탭 식별자
	 */
	selectedId: string;
	/**
	 * 탭을 고를 때
	 */
	onSelect: (id: string) => void;
}

export const UiTabsContext = createContext<UiTabsContextValue | null>(null);
