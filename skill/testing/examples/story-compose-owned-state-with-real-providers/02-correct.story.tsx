// test/orders/orders.story.tsx
import { StoryRoute } from "@test/_gallery/story-route";

import { AppProviders } from "@/app-providers";
import { PgOrders } from "@/page/(main)/orders/pg-orders";

/**
 * 주문 첫 페이지. gallery가 provider를 제공하는 프로젝트에서는 AppProviders 중복 제외
 */
export const Default = () => {
	return (
		<AppProviders>
			<StoryRoute entry="/orders" path="/orders">
				{/* [!code ++] */}
				<PgOrders />
			</StoryRoute>
		</AppProviders>
	);
};

/**
 * URL 정렬 상태를 재현하는 입력
 */
export interface WithSearchProps {
	/**
	 * 화면이 처음 읽을 search 문자열
	 */
	search: string;
}

/**
 * 같은 화면의 URL 입력만 바꾼 story
 */
export const WithSearch = (props: WithSearchProps) => {
	return (
		<AppProviders>
			<StoryRoute entry={`/orders${props.search}`} path="/orders">
				<PgOrders />
			</StoryRoute>
		</AppProviders>
	);
};
