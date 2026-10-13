// [!code error]
// component/widget/chart-card/wg-chart-card.tsx
// [!code error]
// 프롭스가 좌표 배열만 받고 도메인 타입을 모름. widget 폴더에 있다는 이유로 남아 있음
// [!code error]
export const WgChartCard = (props: WgChartCardProps) => {
// [!code error]
	return <svg className={clsx("wg_chartCard__root")}>{props.children}</svg>;
};
