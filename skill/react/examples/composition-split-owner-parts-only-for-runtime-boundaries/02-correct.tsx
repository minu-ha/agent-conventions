// [!code ++]
// component/widget/chatbot/wg-chatbot.tsx
// [!code ++]
/**
// [!code ++]
 * 챗봇 위젯 진입. 대화 목록과 입력 폼 조립
// [!code ++]
 */
// [!code ++]
export const WgChatbot = () => {
	const chat = useChatContext();

	return (
// [!code ++]
		<section className={clsx("wg_chatbot__root")}>
// [!code ++]
			{/**
// [!code ++]
			 * 대화 목록. 비어 있으면 안내 문구 표시
// [!code ++]
			 */}
			{chat.isEmpty && <p className={clsx("wg_chatbot__empty")}>{chat.emptyMessage}</p>}
			{!chat.isEmpty && <WgChatMessages messages={chat.messages} />}
// [!code ++]
			{/**
// [!code ++]
			 * 입력 폼. 전송 중 상태와 폼 프로바이더를 소유해 _wg-chat-composer.tsx로 분리
// [!code ++]
			 */}
// [!code ++]
			<WgChatComposer onSubmit={chat.send} />
// [!code ++]
		</section>
	);
};
