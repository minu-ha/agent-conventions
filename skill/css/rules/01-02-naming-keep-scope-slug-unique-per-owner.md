---
title: Keep Each `scope_slug` Unique Per Owner
titleKo: owner별 scope_slug 고유성 유지
impact: CRITICAL
impactDescription: 관련 없는 route나 컴포넌트가 같은 namespace를 공유해 전역 class 공간에서 충돌하는 것을 막습니다
appliesWhen:
  - 새 `scope_slug` namespace를 추가·복사·이름 변경할 때
  - 서로 다른 owner의 class가 같은 namespace를 사용할 가능성이 있을 때
tags: namespace, ownership, uniqueness
---

## Keep Each `scope_slug` Unique Per Owner

**Impact: CRITICAL (관련 없는 route나 컴포넌트가 같은 namespace를 공유해 전역 class 공간에서 충돌하는 것을 막습니다)**

클래스명은 프로젝트 전역에서 고유해야 하며, 동일한 `scope_slug` 조합은 단일 소유자만 사용할 수 있습니다.
새 스타일을 추가할 때는 먼저 기존 `scope_slug` 충돌 여부를 확인하고,
의미가 겹치더라도 파일이 다르면 별도 slug를 부여합니다.

CSS 파일 하나가 slug 하나를 소유합니다.
여러 하위 component가 부모 slug를 나눠 쓰는 것도 같은 위반입니다.
자기 CSS 파일이 있으면 자기 slug를 만들고, 부모 slug를 계속 쓰려면 스타일도 부모 파일에 두어야 합니다.

**Incorrect (이미 다른 소유자가 쓰는 `scope_slug`를 재사용):**

```txt
// catalog/index route
pg_catalogIndex__header

// dashboard/index route
pg_catalogIndex__toolbar
```

**Correct (소유자가 다르면 별도 slug를 부여):**

```txt
// catalog/index route
pg_catalogIndex__header

// dashboard/index route
pg_dashboardIndex__header
```
