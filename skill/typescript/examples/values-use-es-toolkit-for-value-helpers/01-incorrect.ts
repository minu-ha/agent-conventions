const uniqueOwnerIds = ownerIds.filter((ownerId, index) => ownerIds.indexOf(ownerId) === index);
const uniqueCategories = [...new Set(points.map((point) => point.x))];
const productsByCategory = products.reduce<Record<string, Product[]>>((grouped, product) => {
	grouped[product.category] = [...(grouped[product.category] ?? []), product];
	return grouped;
}, {});
const draftFilter = JSON.parse(JSON.stringify(savedFilter)) as ProductFilter;
const searchKey = rawKey.replace(/([A-Z])/g, "_$1").toLowerCase();
const tickTimes = Array.from({length: tick_count}, (_unused, tickIndex) => toTickTime(tickIndex));
