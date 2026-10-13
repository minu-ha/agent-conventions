// component/ui/tabs/ui-tabs.tsx
// [!code ++]
export const UiTabs = (props: UiTabsProps) => {
	return <div role="tablist">{props.children}</div>;
};
