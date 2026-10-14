type Tone = "positive" | "negative" | "neutral" | "unknown";

<span className={clsx("pg_products__changeRate", `pg_products__changeRate--${tone}`)}>{formatAmount(amount)}</span>;
