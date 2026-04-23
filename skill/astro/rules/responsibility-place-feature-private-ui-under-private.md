---
title: Place Feature-private UI Under `private/`
impact: HIGH
impactDescription: makes the boundary between feature-local implementation and shared public surface obvious
tags: responsibility, private, features
---

## Place Feature-private UI Under `private/`

**Impact: HIGH (makes the boundary between feature-local implementation and shared public surface obvious)**

shared로 승격되지 않은 route-private UI, modal, form, 보조 renderer, feature 전용 CSS는 `src/features/<feature>/private/` 아래에 둡니다. `private/`는 재사용 가능한 public surface가 아니라 현재 feature 내부 전용 구현이라는 소유권을 드러내는 이름입니다. 다른 feature에서도 쓰이기 시작하면 `private/`에 두지 말고 shared layer로 승격합니다. 다만 feature page의 screen orchestration까지 `private/`로 옮기지는 말고, 실제 leaf UI나 local implementation detail만 내려 ownership을 분명히 합니다. 이때 같은 page surface를 설명하는 private markup/CSS는 `loc_*`로 새 namespace를 만드는 대신 기존 `ft_*` owner를 유지합니다.

**Incorrect (feature-local UI가 feature root나 shared components에 섞여 ownership이 흐려짐):**

```text
src/
  components/
    PostMeta.astro
  features/
    post/
      posts-page.astro
      post-remove-modal.astro
      post-remove-modal.css
```

**Correct (feature-local implementation detail은 `private/` 아래에 둠):**

```text
src/
  components/
    Avatar.astro
  features/
    post/
      posts-page.astro
      post.ts
      private/
        post-list-item.astro
        post-meta.astro
        post-remove-modal.astro
        post-remove-modal.css
```
