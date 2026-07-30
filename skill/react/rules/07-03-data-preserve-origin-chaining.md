---
title: Preserve Response and Store Origin in Wide Scopes
titleKo: 넓은 스코프에서의 응답·store 출처 보존
impact: CRITICAL
impactDescription: 파일 전체에서 alias를 따라가지 않아도 값의 출처를 바로 알 수 있게 합니다
appliesWhen:
  - page·layout·screen 넓은 스코프에서 response·mutation·store를 구조분해할 때
  - 원본을 별칭으로 끊고 값 접근 방식을 바꿀 때
reviewWith: screen-keep-derived-values-close
tags: state, origin, response, store
---

## Preserve Response and Store Origin in Wide Scopes

**Impact: CRITICAL (파일 전체에서 alias를 따라가지 않아도 값의 출처를 바로 알 수 있게 합니다)**

페이지, 레이아웃, 화면 스코프에서는 `response...`, `mutation...`, `*Store` 원본을 유지합니다.
넓은 스코프의 구조분해와 별칭 상수는 값의 출처를 흐립니다.

- 실제로 필요하면 handler나 effect 내부의 좁은 스코프에서만 제한적으로 구조분해합니다.
- `props`를 본문 첫 줄에서 구조분해하는 패턴만 예외입니다.

**Incorrect (넓은 스코프 구조분해로 출처가 흐려짐):**

```ts
const { entries, selectedEntry } = responseEntryListSuspense.data;
```

**Correct (원본 체이닝으로 출처를 유지):**

```tsx
<UiList dataSource={responseEntryListSuspense.data.entries} />
<UiTable dataSource={responseEntryListSuspense.data.selectedEntry.fields} />
```

```ts
/**
 * @watch 검색 응답이 비어 있을 때만 후속 동기화를 건너뜀
 */
useEffect(() => {
  const { data, isFetching } = responseEntrySearchSuspense;

  if (!isFetching && data.entries.length === 0) {
    return;
  }
}, [responseEntrySearchSuspense]);
```
