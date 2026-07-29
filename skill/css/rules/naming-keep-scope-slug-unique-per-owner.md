---
title: Keep Each `scope_slug` Unique Per Owner
impact: CRITICAL
impactDescription: >-
  prevents unrelated routes or components from sharing the same namespace and colliding in the global class space
appliesWhen: >-
  새 `scope_slug` namespace를 추가·복사·이름 변경하거나 서로 다른 owner의 class가 같은 namespace를 사용할 가능성이 있다.
tags: namespace, ownership, uniqueness
---

## Keep Each `scope_slug` Unique Per Owner

**Impact: CRITICAL (prevents unrelated routes or components from sharing the same namespace and colliding in the global class space)**

클래스명은 프로젝트 전역에서 고유해야 하며, 동일한 `scope_slug` 조합은 단일 소유자만 사용할 수 있습니다.
새 스타일을 추가할 때는 먼저 기존 `scope_slug` 충돌 여부를 확인하고,
의미가 겹치더라도 파일이 다르면 별도 slug를 부여합니다.

**Incorrect (이미 다른 소유자가 쓰는 `scope_slug`를 재사용):**

```txt
// catalog/index route
rt_catalogIndex__header

// dashboard/index route
rt_catalogIndex__toolbar
```

**Correct (소유자가 다르면 별도 slug를 부여):**

```txt
// catalog/index route
rt_catalogIndex__header

// dashboard/index route
rt_dashboardIndex__header
```
