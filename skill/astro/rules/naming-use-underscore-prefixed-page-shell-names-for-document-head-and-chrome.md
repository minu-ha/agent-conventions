---
title: Use Underscore-prefixed Page Shell Names for Document, Head, and Chrome
impact: MEDIUM-HIGH
impactDescription: keeps page-adjacent non-routes recognizable in file trees and prevents generic shell names from blurring ownership
tags: naming, pages, underscore, document-shells
---

## Use Underscore-prefixed Page Shell Names for Document, Head, and Chrome

**Impact: MEDIUM-HIGH (keeps page-adjacent non-routes recognizable in file trees and prevents generic shell names from blurring ownership)**

`src/pages` 아래의 page-adjacent non-route shell은 `_` prefix와 역할 이름을 함께 사용합니다. 기본적으로 top-level document entry는 `_document.astro`, head concern은 `_head.astro`, body chrome은 `_page-chrome.astro`처럼 둡니다. `_layout.astro`, `_shell.astro`, `_wrapper.astro`, `_base.astro`처럼 generic한 이름은 피하고, feature 이름이 섞인 shell 이름도 `src/pages` 아래에서는 만들지 않습니다. 이렇게 해야 이 파일들이 "route가 아닌 page-adjacent helper"이면서도 각각 어떤 조립 책임을 갖는지 파일명만 보고 바로 알 수 있습니다.

**Incorrect (generic shell 이름이나 feature 이름이 섞여 역할이 흐려짐):**

```text
src/pages/_layout.astro
src/pages/_shell.astro
src/pages/_base.astro
src/pages/_recent-layout.astro
```

**Correct (underscore prefix와 역할 이름으로 document helper를 드러냄):**

```text
src/pages/_document.astro
src/pages/_head.astro
src/pages/_page-chrome.astro
```
