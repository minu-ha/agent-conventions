---
title: Mark Unused Parameters with an Underscore Prefix
impact: MEDIUM
impactDescription: keeps ignored event or callback parameters explicit without pretending they do not exist
tags: typing, params, handlers
---

## Mark Unused Parameters with an Underscore Prefix

**Impact: MEDIUM (keeps ignored event or callback parameters explicit without pretending they do not exist)**

미사용 매개변수는 생략하지 말고 `_` 접두사를 붙여 명시합니다. 특히 React handler에서 이벤트 객체를 받지만 사용하지 않는 경우, 시그니처는 유지하고 의도만 명확히 숨깁니다.

**Incorrect (매개변수를 감추거나 이름만 남김):**

```ts
const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
  // no-op
};
```

**Correct (미사용 매개변수를 명시적으로 표시):**

```ts
const handleChange: ChangeEventHandler<HTMLInputElement> = (_event) => {
  // no-op
};
```
