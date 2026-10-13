// [!code error]
// page/orders/_function/to-display-date.ts
// [!code error]
// 날짜 표시는 orders 화면을 지워도 남음. 지금 이 화면만 쓴다는 이유로 여기 있음
/**
 * 표시 형식 고정. 사용자 로케일을 따르면 목록 정렬 기준과 어긋남
 */
export const toDisplayDate = (value: string): string => {
	return dayjs(value).format(date_format);
};
