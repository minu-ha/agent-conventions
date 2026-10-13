// component/widget/profile-dialog/_hook/use-profile-dialog.ts
/**
 * 대화상자 부품이 나눠 읽는 접힘 상태
 */
interface WgProfileDialogContextValue {
	/**
	 * 본문이 펼쳐져 있는지
	 */
	isBodyOpen: boolean;
	/**
	 * 헤더가 부르는 접기 토글
	 */
	toggleBody: () => void;
}

export const WgProfileDialogContext = createContext<WgProfileDialogContextValue | null>(null);
