// [!code ++]
{/**
// [!code ++]
 * LegacyDatePicker가 className을 받지 않아 배치용 래퍼 필요
// [!code ++]
 */}
// [!code ++]
<div className={clsx("pg_orders__dateField")}>
	<LegacyDatePicker value={value} onChange={handleChange} />
</div>
