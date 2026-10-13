// component/widget/app-shell/wg-app-shell.tsx
export const WgAppShell = (props: WgAppShellProps) => {
	return (
		<div className={clsx("wg_appShell__root")}>
			<WgAppNavigation />

			<main className={clsx("wg_appShell__main")}>
				<UiErrorBoundary fallback={<UiScreenErrorState />}>
					<Suspense fallback={<UiScreenSkeleton />}>{props.children}</Suspense>
				</UiErrorBoundary>
			</main>
		</div>
	);
};
