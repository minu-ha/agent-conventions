---
title: Use Underscore-prefixed Pages-local Helper Names for Document Files
impact: MEDIUM-HIGH
impactDescription: >-
  keeps page-adjacent non-routes recognizable in file trees and prevents generic shell names from blurring ownership
tags: naming, pages, underscore, document-helpers
---

## Use Underscore-prefixed Pages-local Helper Names for Document Files

**Impact: MEDIUM-HIGH (keeps page-adjacent non-routes recognizable in file trees and prevents generic shell names from
blurring ownership)**

`src/pages` 아래의 pages-local document helper와 support file은 `_` prefix와 역할 이름을 함께 사용합니다.

기본 이름:

- `_document.astro`: top-level document entry
- `_document.css`: route-shared body shell style
- `_head.astro`: head/meta concern

피할 이름:

- `_layout.astro`, `_shell.astro`, `_wrapper.astro`, `_base.astro`
- `site-layout.astro`
- 실제 재사용 경계 없는 `_page-chrome.astro`

`_document.astro`와 `_head.astro`의 contract는 각 파일 안의 로컬 `Props`가 직접 소유합니다.

**Incorrect (generic shell 이름이나 feature 이름이 섞여 역할이 흐려짐):**

```text
src/pages/_layout.astro
src/pages/_shell.astro
src/pages/_base.astro
src/pages/site-layout.astro
src/pages/_page-chrome.astro
```

**Correct (underscore prefix와 역할 이름으로 pages-local helper를 드러냄):**

```text
src/pages/_document.astro
src/pages/_document.css
src/pages/_head.astro
```
