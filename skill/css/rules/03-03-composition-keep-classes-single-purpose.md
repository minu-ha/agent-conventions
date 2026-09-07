---
title: Keep Classes Single-purpose
titleKo: 기본 스타일과 상태를 한 클래스에 섞지 않습니다
impact: MEDIUM
impactDescription: 기본 스타일과 상태를 분리해 상태만 켜고 끌 수 있습니다
appliesWhen:
  - 상태를 나타내는 낱말이 들어간 요소 클래스 이름을 추가·변경할 때
  - 제외: 처음부터 기본 클래스와 수정자를 나눠 만드는 경우
  - 제외: 책임이 그대로인 이름 변경만 하는 경우
tags: composition, modifiers, responsibility
---

## Keep Classes Single-purpose

**Impact: MEDIUM (기본 스타일과 상태를 분리해 상태만 켜고 끌 수 있습니다)**

기본 스타일과 상태는 기본 클래스와 `--수정자`로 나눕니다.
`listButtonActive`처럼 상태를 기본 이름에 넣으면 기본 스타일만 재사용하거나 상태만 끌 수 없습니다.

수정자로 표현할 수 있는 상태인지는 `composition-do-not-build-structural-variants-with-modifiers` 규칙이 판단합니다.

**Incorrect (기본 클래스 이름에 상태를 포함합니다):**

```tsx
<div className={clsx("pg_catalogIndex__listButtonActive")} />
```

**Correct (기본 클래스와 상태 수정자를 분리합니다):**

```tsx
<div className={clsx("pg_catalogIndex__listButton", isActive && "pg_catalogIndex__listButton--active")} />
```
