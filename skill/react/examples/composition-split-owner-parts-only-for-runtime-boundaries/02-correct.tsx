// component/widget/chatbot/wg-chatbot.tsx
/**
 * 챗봇 위젯 진입. 대화 목록과 입력 폼 조립
 */
export const WgChatbot = () => {
	const chat = useChatContext();

	return (
		<section className={clsx("wg_chatbot__root")}>
			{/**
			 * 대화 목록. 비어 있으면 안내 문구 표시
			 */}
			{chat.isEmpty && <p className={clsx("wg_chatbot__empty")}>{chat.emptyMessage}</p>}
			{!chat.isEmpty && <WgChatMessages messages={chat.messages} />}
			{/**
			 * 입력 폼. 전송 중 상태와 폼 프로바이더를 소유해 _wg-chat-composer.tsx로 분리
			 */}
			<WgChatComposer onSubmit={chat.send} />
		</section>
	);
};
