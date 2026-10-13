// component/widget/user-card/wg-user-card.tsx
// [!code ++]
import {WgUserCardAvatar} from "@/component/widget/user-card/_wg-user-card-avatar";

export const WgUserCard = (props: WgUserCardProps) => {
	return (
		<section>
{/* [!code ++] */}
			<WgUserCardAvatar src={props.user.avatarUrl} alt={props.user.name} theme={props.theme} />
		</section>
	);
};
