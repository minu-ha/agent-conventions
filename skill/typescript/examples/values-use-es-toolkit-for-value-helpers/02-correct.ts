import {cloneDeep, groupBy, range, snakeCase, uniq} from "es-toolkit";

const uniqueOwnerIds = uniq(ownerIds);
const uniqueCategories = uniq(points.map((point) => point.x));
const productsByCategory = groupBy(products, (product) => product.categoryId);
const draftFilter = cloneDeep(savedFilter);
const searchKey = snakeCase(rawKey);
const tickTimes = range(tick_count).map((tickIndex) => toTickTime(tickIndex));
