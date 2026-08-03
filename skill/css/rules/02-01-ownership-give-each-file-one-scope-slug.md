---
title: Give Each CSS File Its Own `scope_slug`
titleKo: CSS 파일마다 범위_식별자를 하나만 씁니다
impact: CRITICAL
impactDescription: 여러 컴포넌트가 같은 네임스페이스를 나눠 쓰면 전역에서 충돌합니다
appliesWhen:
  - 새 `scope_slug`를 만들거나 기존 식별자를 복사·이름 변경할 때
  - 서로 다른 컴포넌트가 같은 식별자를 쓸 가능성이 있을 때
tags: namespace, ownership, uniqueness
---

## Give Each CSS File Its Own `scope_slug`

**Impact: CRITICAL (여러 컴포넌트가 같은 네임스페이스를 나눠 쓰면 전역에서 충돌합니다)**

CSS 파일마다 식별자가 하나입니다. 같은 식별자를 쓰는 파일은 프로젝트 전역에서 그 하나뿐입니다.

- 새 스타일을 추가하기 전에 같은 식별자를 쓰는 파일이 이미 있는지 확인합니다.
- 의미가 겹쳐도 파일이 다르면 식별자를 따로 만듭니다.
- 하위 컴포넌트 여럿이 부모 식별자를 나눠 쓰는 것도 같은 위반입니다.
- 자기 CSS 파일이 있으면 자기 식별자를 만듭니다. 부모 식별자를 계속 쓰려면 스타일도 부모 파일에 둡니다.

**Incorrect (이미 다른 소유자가 쓰는 `scope_slug`를 재사용):**

```txt
// catalog/index route
pg_catalogIndex__header

// dashboard/index route
pg_catalogIndex__toolbar
```

**Correct (소유자가 다르면 별도 식별자를 부여):**

```txt
// catalog/index route
pg_catalogIndex__header

// dashboard/index route
pg_dashboardIndex__header
```
