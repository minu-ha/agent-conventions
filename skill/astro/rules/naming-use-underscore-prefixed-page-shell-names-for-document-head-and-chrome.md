---
title: Use Underscore-prefixed Pages-local Helper Names for Document Files
impact: MEDIUM-HIGH
impactDescription: keeps page-adjacent non-routes recognizable in file trees and prevents generic shell names from blurring ownership
tags: naming, pages, underscore, document-helpers
---

## Use Underscore-prefixed Pages-local Helper Names for Document Files

**Impact: MEDIUM-HIGH (keeps page-adjacent non-routes recognizable in file trees and prevents generic shell names from blurring ownership)**

`src/pages` 아래의 pages-local document helper와 support file은 `_` prefix와 역할 이름을 함께 사용합니다. 기본적으로 top-level document entry는 `_document.astro`, route-shared body shell style은 `_document.css`, head concern은 `_head.astro`처럼 둡니다. `_layout.astro`, `_shell.astro`, `_wrapper.astro`, `_base.astro`, `site-layout.astro`처럼 generic한 이름은 피하고, 특별한 이유 없이 `_page-chrome.astro` 같은 추가 body-shell helper도 만들지 않습니다. `_document.astro`와 `_head.astro`의 contract는 각 파일 안의 로컬 `Props`가 직접 소유합니다. 이렇게 해야 이 파일들이 "route가 아닌 pages-local document helper"이면서도 각각 어떤 조립 책임을 갖는지 파일명만 보고 바로 알 수 있습니다.

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
