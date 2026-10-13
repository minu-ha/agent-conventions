// component/widget/user-card/wg-user-card.tsx
// [!code error]
export const WgUserCard = (props: WgUserCardProps) => {
// [!code error]
	const Avatar = () => {
// [!code error]
		return (
// [!code error]
			<img
// [!code error]
				className={clsx(
// [!code error]
					"wg_userCardAvatar__image",
// [!code error]
					props.theme === "dark" && "wg_userCardAvatar__image--dark",
// [!code error]
				)}
// [!code error]
				src={props.user.avatarUrl}
// [!code error]
				alt={props.user.name}
// [!code error]
			/>
// [!code error]
		);
// [!code error]
	};

	return (
		<section>
// [!code error]
			<Avatar />
		</section>
	);
};
