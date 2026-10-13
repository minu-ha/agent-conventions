// page/product-detail/_pg-product-detail-summary.tsx: 없음을 읽는 곳은 렌더하는 분기 하나
{isNotNil(summary.changeRate) && (
	<UiBadge tone={toSignedTone(summary.changeRate)}>{formatSignedPercent(summary.changeRate)}</UiBadge>
)}
