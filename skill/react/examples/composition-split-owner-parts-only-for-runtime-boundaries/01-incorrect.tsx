// [!code error]
// component/widget/chatbot/_wg-chat-content.tsx: 어느 화면을 그릴지 고르기만 하고 상태는 소유 안 함
// [!code error]
export const WgChatContent = () => {
	const chat = useChatContext();

	return (
// [!code error]
		<Fragment>
			{chat.isEmpty && <p className={clsx("wg_chatbot__empty")}>{chat.emptyMessage}</p>}
			{!chat.isEmpty && <WgChatMessages messages={chat.messages} />}
// [!code error]
		</Fragment>
	);
};
