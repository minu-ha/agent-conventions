// [!code ++]
/**
// [!code ++]
 * 프로필 요약만 보여 주는 고정 구조 대화상자
// [!code ++]
 *
// [!code ++]
 * 사용처가 끼워 넣을 자리가 없어 부품으로 안 쪼갬
// [!code ++]
 */
export interface WgProfileDialogProps {
// [!code ++]
	/**
// [!code ++]
	 * 헤더에 그릴 제목
// [!code ++]
	 */
// [!code ++]
	title: string;
// [!code ++]
	/**
// [!code ++]
	 * 요약 영역에 그릴 프로필
// [!code ++]
	 */
// [!code ++]
	profile: Profile;
}

export const WgProfileDialog = (props: WgProfileDialogProps) => {
	return (
// [!code ++]
		<section className={clsx("wg_profileDialog__root")}>
// [!code ++]
			<header className={clsx("wg_profileDialog__header")}>
// [!code ++]
				<h3>{props.title}</h3>
			</header>
// [!code ++]
			<WgProfileSummary profile={props.profile} />
		</section>
	);
};
