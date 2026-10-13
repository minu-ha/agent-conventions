// [!code error]
// component/ui/badge/ui-badge.tsx: 칩까지 한 파일에 두고 타입은 위쪽에 모음
// [!code error]
interface UiBadgeProps {
// [!code error]
	label: string;
// [!code error]
}

// [!code error]
interface UiChipProps {
	label: string;
}

export const UiBadge = (props: UiBadgeProps) => {
	return <span className={clsx("ui_badge__root")}>{props.label}</span>;
};

// [!code error]
export const UiChip = (props: UiChipProps) => {
// [!code error]
	return <span className={clsx("ui_chip__root")}>{props.label}</span>;
// [!code error]
};
