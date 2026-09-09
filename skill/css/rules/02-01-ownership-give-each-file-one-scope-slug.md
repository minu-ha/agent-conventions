---
title: Give Each CSS File Its Own `scope_slug`
titleKo: CSS 파일마다 고유한 범위_식별자를 하나씩 씁니다
impact: CRITICAL
impactDescription: 파일마다 네임스페이스를 구분해 전역 클래스 충돌을 막습니다
appliesWhen:
  - 새 식별자를 만들거나 기존 식별자를 복사 · 이름 변경할 때
  - 부품에 CSS 파일을 새로 만들면서 부모 식별자를 그대로 쓸 때
tags: namespace, ownership, uniqueness
---

## Give Each CSS File Its Own `scope_slug`

**Impact: CRITICAL (파일마다 네임스페이스를 구분해 전역 클래스 충돌을 막습니다)**

CSS 파일마다 고유한 범위_식별자를 하나씩 씁니다. 같은 범위_식별자를 여러 파일에서 나누어 쓰지 않습니다.

| 상황 | 처리 |
| --- | --- |
| 새 스타일을 추가함 | 같은 범위_식별자를 쓰는 파일이 있는지 먼저 확인합니다 |
| 의미가 같아도 CSS 파일이 다름 | 식별자를 따로 만듭니다. 부품끼리 부모 식별자를 나누어 쓰는 것도 금지합니다 |
| 부모 식별자를 계속 씀 | 스타일도 부모 CSS 파일에 둡니다 |

**Incorrect 1 (이미 다른 소유자가 쓰는 `scope_slug`를 재사용합니다):**

```txt
/* products route */
pg_products__header

/* order/index route */
pg_products__header
```

**Correct 1 (소유자가 다르면 별도 식별자를 부여합니다):**

```txt
/* products route */
pg_products__header

/* order/index route */
pg_orderIndex__header
```

**Incorrect 2 (부품의 CSS 파일이 부모 식별자를 그대로 씁니다):**

```txt
/* page/detail/_pg-chart-card.css */
pg_detail__chartCard
```

**Correct 2 (자기 CSS 파일을 가진 컴포넌트는 자기 식별자를 씁니다):**

```txt
/* page/detail/_pg-chart-card.css */
pg_chartCard__root
```
