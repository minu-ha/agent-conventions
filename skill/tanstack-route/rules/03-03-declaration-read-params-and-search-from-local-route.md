---
title: Read Params and Search From the Local `Route`
titleKo: params·search의 로컬 Route 접근
impact: MEDIUM-HIGH
impactDescription: param·search 접근을 계약을 소유한 route 파일에 맞춥니다
tags: route-hooks, params, search
---

## Read Params and Search From the Local `Route`

**Impact: MEDIUM-HIGH (param·search 접근을 계약을 소유한 route 파일에 맞춥니다)**

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
