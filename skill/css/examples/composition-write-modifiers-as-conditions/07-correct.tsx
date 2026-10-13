export interface WgUserCardProps {
	role: "owner" | "member";
	label: string;
	description: string;
}

export const WgUserCard = (props: WgUserCardProps) => {
	return (
		<div
			className={clsx(
				"wg_userCard__root",
				props.role === "owner" && "wg_userCard__root--owner",
				props.role === "member" && "wg_userCard__root--member",
			)}
		>
			<span
				className={clsx(
					"wg_userCard__title",
					props.role === "owner" && "wg_userCard__title--owner",
					props.role === "member" && "wg_userCard__title--member",
				)}
			>
				{props.label}
			</span>
			<p
				className={clsx(
					"wg_userCard__description",
					props.role === "owner" && "wg_userCard__description--owner",
					props.role === "member" && "wg_userCard__description--member",
				)}
			>
				{props.description}
			</p>
		</div>
	);
};
