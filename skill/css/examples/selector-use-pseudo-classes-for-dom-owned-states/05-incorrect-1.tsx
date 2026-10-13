<button
	type="button"
	aria-pressed={isSelected}
// [!code error]
	className={clsx("pg_products__card", isDisabled && "pg_products__card--disabled")}
>
	{product.name}
</button>
