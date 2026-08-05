---
title: Keep Classes Single-purpose
titleKo: 클래스 하나는 시각 결정 하나만 담습니다
impact: HIGH
impactDescription: 클래스 하나가 기본 스타일과 상태 의미를 함께 지면 상태를 끌 방법이 없습니다
appliesWhen:
  - 한 클래스 이름에 기본 스타일과 상태를 함께 넣을 때
  - 제외: 처음부터 기본 클래스와 수정자를 나눠 만드는 경우
  - 제외: 책임이 그대로인 이름 변경만 하는 경우
tags: composition, modifiers, responsibility
---

## Keep Classes Single-purpose

**Impact: HIGH (클래스 하나가 기본 스타일과 상태 의미를 함께 지면 상태를 끌 방법이 없습니다)**

클래스 하나는 시각 결정 하나만 담습니다.
기본 스타일과 상태를 이름 하나에 녹이지 않습니다.

`listButtonActive`처럼 상태를 이름에 녹이면 기본만 필요한 곳에서 재사용할 수 없고 상태를 끄는 방법도 없습니다.
기본 클래스와 `--수정자`를 따로 두면 둘 다 해결됩니다.

수정자가 상태를 표현할 자격이 있는지는
`composition-do-not-build-structural-variants-with-modifiers` 규칙이 판정합니다.

**Incorrect (상태 의미를 별도 클래스 역할처럼 합쳐 버림):**

```tsx
<div className={clsx("pg_catalogIndex__listButtonActive")} />
```

**Correct (기본 클래스와 상태 수정자를 분리):**

```tsx
<div className={clsx("pg_catalogIndex__listButton", isActive && "pg_catalogIndex__listButton--active")} />
```
