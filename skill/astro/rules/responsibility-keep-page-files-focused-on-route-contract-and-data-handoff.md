---
title: Keep Page Files Focused on Route Contract and Data Handoff
impact: HIGH
impactDescription: keeps `src/pages` readable as route boundaries instead of turning them into giant mixed concerns
tags: pages, routing, responsibility
---

## Keep Page Files Focused on Route Contract and Data Handoff

**Impact: HIGH (keeps `src/pages` readable as route boundaries instead of turning them into giant mixed concerns)**

page file은 URL contract, `getStaticPaths()`, `prerender`, page-level data selection, layout 조립과 같은 route boundary 책임을 가집니다. 재사용 가능한 render detail, large markup block, browser interaction은 component나 island로 내려 page가 경계 역할을 유지하게 둡니다.

**Incorrect (page 파일이 route contract와 재사용 렌더링 상세를 한꺼번에 가짐):**

```astro
---
const products = await getProducts();
---

<section>
	{products.map((product) => (
		<article class="card">
			<h2>{product.name}</h2>
			<p>{product.description}</p>
			<button data-id={product.id}>Add to cart</button>
		</article>
	))}
</section>
```

**Correct (page는 route/data handoff를 소유하고 render detail은 component로 넘김):**

```astro
---
import ProductsIndexPage from "../../components/products/ProductsIndexPage.astro";

const products = await getProducts();
---

<ProductsIndexPage products={products} />
```
