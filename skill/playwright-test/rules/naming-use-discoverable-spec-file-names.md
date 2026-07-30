---
title: Use Discoverable Spec File Names
titleKo: spec 파일 이름은 찾기 쉽게
impact: HIGH
impactDescription: keeps spec purpose searchable by encoding feature and level directly into the filename
impactDescriptionKo: 기능과 층위를 파일명에 직접 담아 spec 의 목적을 검색 가능하게 유지함
tags: filenames, discovery, levels
---

## Use Discoverable Spec File Names

**Impact: HIGH (keeps spec purpose searchable by encoding feature and level directly into the filename)**

Integration은 `*.spec.ts`, E2E는 `*.e2e.spec.ts`를 사용하고, 파일명에는 라우트나 기능 이름이 바로 보이게 유지합니다.
`index.spec.ts`, `test.spec.ts`처럼 탐색이 어려운 이름은 금지합니다.

**Incorrect (파일명만 봐서는 기능과 레벨이 보이지 않음):**

```txt
index.spec.ts
test.spec.ts
members.test.ts
```

**Correct (기능과 레벨이 즉시 보임):**

```txt
login.spec.ts
login.e2e.spec.ts
members.form.{-$mid}.spec.ts
members.e2e.spec.ts
```
