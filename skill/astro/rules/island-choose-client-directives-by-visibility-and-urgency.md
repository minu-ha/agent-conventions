---
title: Choose `client:*` Directives by Visibility and Urgency
titleKo: client:* 지시자는 가시성과 시급성으로 선택
impact: HIGH
impactDescription: makes hydration cost intentional instead of defaulting everything to eager loading
tags: client-directives, islands, hydration
---

## Choose `client:*` Directives by Visibility and Urgency

**Impact: HIGH (makes hydration cost intentional instead of defaulting everything to eager loading)**

`client:load`, `client:idle`, `client:visible`, `client:media`, `client:only`는 모두 같은 비용이 아닙니다.
above-the-fold 즉시 상호작용이 필요한 widget만 eager hydration을 쓰고, 그 외에는 visibility/idle 조건에 맞게 낮춥니다.
특히 `client:only`는 server HTML을 생략하므로 일반 hydration 대체재처럼 쓰지 않습니다.

**Incorrect (모든 island를 습관적으로 `client:load`에 올림):**

```astro
<SearchBox client:load />
<ThemePicker client:load />
<FaqAccordion client:load />
```

**Correct (urgency와 visibility에 맞게 hydration 시점을 나눔):**

```astro
<SearchBox client:load />
<ThemePicker client:idle />
<FaqAccordion client:visible />
```
