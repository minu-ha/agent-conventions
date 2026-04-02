---
title: Avoid Premature Abstraction in Screen Code
impact: HIGH
impactDescription: 추측성 추출 대신 실제 재사용 경계에 맞춰 route 코드를 유지함
tags: screen, abstraction, reuse
---

## Avoid Premature Abstraction in Screen Code

**Impact: HIGH (추측성 추출 대신 실제 재사용 경계에 맞춰 route 코드를 유지함)**

반복이 보인다는 이유만으로 즉시 공용 hook, 공용 컴포넌트, 공용 helper로 올리지 않습니다. 실제 재사용 범위가 둘 이상에서 검증되고 계약이 안정되었을 때만 공용화를 허용합니다.

**Incorrect (반복만 보고 성급하게 추상화):**

```ts
const usePermissionA = () => {
  // 유사 로직
};

const usePermissionB = () => {
  // 유사 로직
};
```

**Correct (계약이 생긴 뒤에 공용화):**

```ts
/**
 * @summary 입력 검증, 저장, 오류 표시 계약
 */
export const useContentEditor = () => {
  // ...
};
```
