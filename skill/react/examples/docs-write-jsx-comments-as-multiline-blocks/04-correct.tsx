// [!code ++]
{/**
// [!code ++]
 * LegacyDatePicker가 className을 받지 않아 배치용 래퍼 필요
// [!code ++]
 */}
<div className={clsx("pg_products__datePicker")}>
	<LegacyDatePicker value={value} onChange={handleChange} />
</div>;
