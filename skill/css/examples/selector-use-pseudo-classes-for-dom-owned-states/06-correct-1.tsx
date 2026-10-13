<button
	type="button"
	aria-pressed={isSelected}
// [!code ++]
	disabled={isDisabled}
// [!code ++]
	className={clsx("pg_products__card", isSelected && "pg_products__card--selected")}
>
	{product.name}
</button>
