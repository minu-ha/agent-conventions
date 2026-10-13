// component/widget/user-card/wg-user-card.tsx
export const WgUserCard = (props: WgUserCardProps) => {
	const Avatar = () => {
		return (
			<img
				className={clsx(
					"wg_userCardAvatar__image",
					props.theme === "dark" && "wg_userCardAvatar__image--dark",
				)}
				src={props.user.avatarUrl}
				alt={props.user.name}
			/>
		);
	};

	return (
		<section>
			<Avatar />
		</section>
	);
};
