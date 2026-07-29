---
title: Define Build-time Collections in `src/content.config.ts`
impact: HIGH
impactDescription: centralizes content ownership and keeps collection shape from being redefined across pages
tags: content-collections, config, loaders
---

## Define Build-time Collections in `src/content.config.ts`

**Impact: HIGH (centralizes content ownership and keeps collection shape from being redefined across pages)**

build-time content collection 정의는 `src/content.config.ts`에서 한 번에 관리합니다.
page 파일 안에서 glob, frontmatter parsing,
ad-hoc shape normalization을 반복하지 말고 collection loader와 registration을 중앙화합니다.
요청마다 fresh한 데이터를 가져오는 live collection은 이 파일이 아니라 `src/live.config.ts`와 `defineLiveCollection()`
쪽으로 분리합니다.

**Incorrect (page 파일 안에서 raw glob과 frontmatter parsing을 직접 반복):**

```astro
---
const posts = await Astro.glob("../content/blog/*.md");
const sortedPosts = posts
	.map((post) => ({ title: post.frontmatter.title, href: `/blog/${post.file.split("/").at(-1)?.replace(".md", "")}/` }))
	.toSorted((left, right) => right.title.localeCompare(left.title));
---
```

**Correct (collection 정의는 config에 모으고 page는 collection API만 사용):**

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
	loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
});

export const collections = { blog };
```
