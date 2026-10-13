// component/ui/tabs/ui-tabs.tsx
// [!code error]
const UiTabs = (props: UiTabsProps) => {
	return <div role="tablist">{props.children}</div>;
};

// [!code error]
export default UiTabs;
