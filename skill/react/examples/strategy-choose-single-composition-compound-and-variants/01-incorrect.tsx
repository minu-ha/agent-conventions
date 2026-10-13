export interface WgProfileDialogProps {
// [!code error]
	isCompact?: boolean;
// [!code error]
	showActivity?: boolean;
// [!code error]
	showFocus?: boolean;
// [!code error]
	dialogTitle?: string;
// [!code error]
	renderFooter?: () => ReactNode;
}

export const WgProfileDialog = (props: WgProfileDialogProps) => {
	return (
// [!code error]
		<section className={props.isCompact ? "dialog dialog--compact" : "dialog"}>
// [!code error]
			<header>
// [!code error]
				<h3>{props.dialogTitle}</h3>
			</header>
// [!code error]
			<WgProfileSummary />
// [!code error]
			{props.showActivity && <WgProfileActivityPanel />}
// [!code error]
			{props.showFocus && <WgProfileFocusPanel />}
// [!code error]
			<footer>{props.renderFooter?.()}</footer>
		</section>
	);
};
