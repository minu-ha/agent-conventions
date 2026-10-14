const productIds = (responseProductSearch.data.rows ?? []).map((row) => row.id);
const isCompact = (variant ?? "default") === "compact";
