export interface UiPanelHeaderProps {
	children: ReactNode;
}

// [!code error]
/**
// [!code error]
 * 패널 헤더 부품
// [!code error]
 */
export const UiPanelHeader = (props: UiPanelHeaderProps) => {
	return <header className={clsx("ui_panel__header")}>{props.children}</header>;
};
