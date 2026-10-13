<span
	className={clsx(
		"pg_products__changeRate",
		tone === "positive" && "pg_products__changeRate--positive",
		tone === "negative" && "pg_products__changeRate--negative",
	)}
>
	{amount}
</span>;
