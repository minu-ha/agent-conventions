// 결제 위젯은 마운트할 때 금액을 한 번만 읽음. 다시 불러오는 중에 그리면 옛 금액으로 초기화
if (responseOrderAmountSuspense.isFetching) {
	return <PgOrderAmountLoadingScreen />;
}

return <PgPaymentWidgetSection amount={responseOrderAmountSuspense.data.confirmedAmount} />;
