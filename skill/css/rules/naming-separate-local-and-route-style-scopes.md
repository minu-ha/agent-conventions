---
title: Separate Local and Route Style Scopes
impact: HIGH
impactDescription: keeps route-shared styles and `-local` component styles from mixing into the same namespace or file
tags: local-scope, route-scope, css-files
---

## Separate Local and Route Style Scopes

**Impact: HIGH (keeps route-shared styles and `-local` component styles from mixing into the same namespace or file)**

`-local` 폴더 컴포넌트의 스타일은 반드시 같은 `-local` 계층의 전용 `*.css` 파일에 작성하고, 클래스는 `loc_` 스코프를 사용합니다. 반대로 route 공용 스타일은 route 소유 CSS 파일에서 `rt_*` 스코프를 사용하며, 두 범위를 한 파일에 섞지 않습니다.

**Incorrect (route 공용 CSS와 local 전용 CSS를 섞음):**

```txt
entries.css
  rt_entries__list
  loc_modalEntryColumnForm__root
```

**Correct (route와 local 스타일의 파일/스코프를 분리):**

```txt
entries.css
  rt_entries__list

-local/modal-entry-column-form.css
  loc_mecf__root
```
