---
title: Distinguish Build-time and Live Collections
impact: HIGH
impactDescription: prevents freshness assumptions from drifting between static content and request-time content
tags: content-collections, live-collections, loaders
---

## Distinguish Build-time and Live Collections

**Impact: HIGH (prevents freshness assumptions from drifting between static content and request-time content)**

build-time content collection과 live collection은 같은 개념으로 취급하지 않습니다.
build-time collection은 `src/content.config.ts`와 `defineCollection()`에 두고 `getCollection()`/`getEntry()`로 읽습니다.
요청마다 fresh한 CMS나 API 데이터를 다뤄야 하면 `src/live.config.ts`와 `defineLiveCollection()`을 사용하고 `getLiveCollection()`/`getLiveEntry()`로 접근합니다.
live collection은 on-demand rendering 전제도 함께 갖습니다.

**Incorrect (request-time freshness가 필요한 데이터를 build-time collection처럼 취급함):**

```text
- 실시간 상품 데이터는 `src/content.config.ts`에 등록한다
- page에서는 `getCollection("products")`로 읽고 재빌드 없이 최신값을 기대한다
```

**Correct (build-time과 live collection의 config와 query를 분리함):**

```ts
import { defineLiveCollection } from "astro:content";
import { productLoader } from "./loaders/product-loader";

const products = defineLiveCollection({
	loader: productLoader({ endpoint: process.env.PRODUCTS_API_URL }),
});

export const collections = { products };
```
