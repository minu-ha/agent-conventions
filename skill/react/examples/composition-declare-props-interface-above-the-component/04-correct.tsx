// [!code ++]
/**
// [!code ++]
 * 패널 헤더 부품
// [!code ++]
 *
// [!code ++]
 * 제목과 우측 동작 영역은 사용처가 직접 조립
// [!code ++]
 */
export interface UiPanelHeaderProps {
// [!code ++]
	/**
// [!code ++]
	 * 헤더 줄에 늘어놓을 제목과 동작
// [!code ++]
	 */
	children: ReactNode;
}

export const UiPanelHeader = (props: UiPanelHeaderProps) => {
	return <header className={clsx("ui_panel__header")}>{props.children}</header>;
};
