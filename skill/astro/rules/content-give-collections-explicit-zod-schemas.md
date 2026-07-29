---
title: Give Collections Explicit Zod Schemas
impact: HIGH
impactDescription: makes structured content type-safe and prevents frontmatter drift from leaking into pages
tags: content-collections, zod, schema
---

## Give Collections Explicit Zod Schemas

**Impact: HIGH (makes structured content type-safe and prevents frontmatter drift from leaking into pages)**

구조화된 collection은 loader만 두고 끝내지 말고 schema를 명시적으로 둡니다.
collection entry shape를 page마다 추측하거나 optional chaining으로 봉합하지 말고 `astro:zod` 기반 schema에서 타입과
validation을 고정합니다.

**Incorrect (structured content인데 schema 없이 느슨하게 사용):**

```ts
const docs = defineCollection({
	loader: glob({ base: "./src/content/docs", pattern: "**/*.md" }),
});
```

**Correct (collection schema로 필수 필드와 타입을 명시):**

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const docs = defineCollection({
	loader: glob({ base: "./src/content/docs", pattern: "**/*.md" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		order: z.number().int(),
		draft: z.boolean().default(false),
	}),
});
```
