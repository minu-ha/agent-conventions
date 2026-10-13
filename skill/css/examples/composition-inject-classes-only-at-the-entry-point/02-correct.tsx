export interface UiCollapseProps {
	className?: string;
// [!code ++]
	variant?: "default" | "compact";
// [!code ++]
	title: ReactNode;
// [!code ++]
	children: ReactNode;
}
