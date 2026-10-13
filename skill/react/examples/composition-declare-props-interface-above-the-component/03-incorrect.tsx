export interface UiPanelHeaderProps {
	children: ReactNode;
}

// [!code error]
/**
 * 패널 헤더 부품
 */
export const UiPanelHeader = (props: UiPanelHeaderProps) => {
	return <header className={clsx("ui_panel__header")}>{props.children}</header>;
};
