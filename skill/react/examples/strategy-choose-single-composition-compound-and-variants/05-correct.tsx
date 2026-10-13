/**
 * 읽기 전용 프로필 대화상자
 *
 * 세 화면이 같은 조합을 쓰므로 조립을 한 이름 뒤로 고정
 */
export interface WgReadOnlyProfileDialogProps {
	/**
	 * 요약 영역에 그릴 프로필
	 */
	profile: Profile;
}

export const WgReadOnlyProfileDialog = (props: WgReadOnlyProfileDialogProps) => {
	return (
		<WgProfileDialog.Root>
			<WgProfileDialog.Header>프로필 보기</WgProfileDialog.Header>
			<WgProfileDialog.Body>
				<WgProfileSummary profile={props.profile} />
			</WgProfileDialog.Body>
		</WgProfileDialog.Root>
	);
};
