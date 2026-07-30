---
title: Read Params and Search From the Local `Route`
titleKo: params와 search는 로컬 Route에서 읽기
impact: MEDIUM-HIGH
impactDescription: keeps param and search access aligned with the route file that owns the contract
tags: route-hooks, params, search
---

## Read Params and Search From the Local `Route`

**Impact: MEDIUM-HIGH (keeps param and search access aligned with the route file that owns the contract)**

param과 search 접근은 해당 파일의 `Route`에서 꺼내 쓰는 것을 기본으로 합니다.
훅 사용 패턴을 route definition 근처에서 일관되게 유지하면,
이 파일이 어떤 params/search 계약을 갖는지 한 곳에서 읽을 수 있습니다.

**Incorrect (전역 hook 호출로 계약 출처를 흐림):**

```tsx
const params = useParams({from: "/app/(users)/users/{$userId}/"});
const search = useSearch({from: "/app/(users)/users/"});
```

**Correct (해당 파일의 `Route`에서 직접 읽음):**

```tsx
const {useParams, useSearch} = Route;

const params = useParams();
const search = useSearch();
```
