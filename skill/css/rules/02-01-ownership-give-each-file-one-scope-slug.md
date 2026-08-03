---
title: Give Each CSS File Its Own `scope_slug`
titleKo: CSS 파일 하나당 scope_slug 하나
impact: CRITICAL
impactDescription: 서로 다른 컴포넌트가 같은 네임스페이스를 나눠 쓰다가 전역 클래스 공간에서 충돌하는 것을 막습니다
appliesWhen:
  - 새 `scope_slug`를 만들거나 기존 slug를 복사·이름 변경할 때
  - 서로 다른 컴포넌트가 같은 slug를 쓸 가능성이 있을 때
tags: namespace, ownership, uniqueness
---

## Give Each CSS File Its Own `scope_slug`

**Impact: CRITICAL (서로 다른 컴포넌트가 같은 네임스페이스를 나눠 쓰다가 전역 클래스 공간에서 충돌하는 것을 막습니다)**

CSS 파일 하나가 slug 하나를 가집니다. 그 slug는 프로젝트 전역에서 그 파일만 씁니다.

- 새 스타일을 추가하기 전에 같은 slug를 쓰는 파일이 이미 있는지 확인합니다.
- 의미가 겹쳐도 파일이 다르면 slug를 따로 만듭니다.
- 하위 컴포넌트 여럿이 부모 slug를 나눠 쓰는 것도 같은 위반입니다.
- 자기 CSS 파일이 있으면 자기 slug를 만듭니다. 부모 slug를 계속 쓰려면 스타일도 부모 파일에 둡니다.

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
