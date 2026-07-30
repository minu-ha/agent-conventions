---
title: Prefer `Ui*` Wrapper Prop Types
titleKo: 라이브러리 원본 대신 Ui* wrapper Props 타입
impact: MEDIUM-HIGH
impactDescription: >-
  preserves wrapper-level styling and API contracts instead of leaking raw library prop types into usage sites
appliesWhen: >-
  `Ui*` wrapper 사용처나 wrapper API에서 Props 타입을 선언·추론·재사용하고 라이브러리 원본 Props 참조를 검토한다.
requiresSelected: typescript/types-reuse-existing-contracts-before-new-types
tags: props, wrappers, types
---

## Prefer `Ui*` Wrapper Prop Types

**Impact: MEDIUM-HIGH (preserves wrapper-level styling and API contracts instead of leaking raw library prop types into
usage sites)**

`Ui*` 래퍼 컴포넌트를 사용할 때는 라이브러리 원본 Props 타입이 아니라 래퍼가 노출한 `Ui*Props` 타입을 우선 사용합니다.
그래야 wrapper가 의도적으로 제한하거나 보강한 스타일링 계약과 API 경계를 유지할 수 있습니다.

**Incorrect (라이브러리 원본 Props 타입을 직접 참조):**

```tsx
import UiCollapse, {type AntDesignCollapseProps} from "<project-alias>/components/ui/collapse/ui-collapse.tsx";

const items: NonNullable<AntDesignCollapseProps["items"]> = [];
```

**Correct (wrapper가 노출한 Props 타입을 사용):**

```tsx
import UiCollapse, {type UiCollapseProps} from "<project-alias>/components/ui/collapse/ui-collapse.tsx";

const items: NonNullable<UiCollapseProps["items"]> = [];
```
