---
title: Use Lazy State Initializers for Expensive Defaults
titleKo: 무거운 초기값 계산은 초기화 함수로 감쌉니다
impact: MEDIUM
impactDescription: 무거운 초기 상태 계산이 이후 렌더에서 반복되지 않습니다
appliesWhen:
  - `useState` 초기값에 `localStorage` 파싱, 인덱스 생성, 큰 배열 정규화 같은 비용이 큰 계산을 넣을 때
  - 제외: 숫자 · 문자열 같은 단순 값이나 프롭을 그대로 초기값에 넣는 경우
reviewWith: perf-avoid-defensive-memoization
tags: perf, state
---

## Use Lazy State Initializers for Expensive Defaults

**Impact: MEDIUM (무거운 초기 상태 계산이 이후 렌더에서 반복되지 않습니다)**

`useState`의 초기값 계산이 무거우면 값을 직접 넣지 않고 초기화 함수로 전달합니다.
이후 렌더의 반복 계산을 피하는 용도이므로 별도 측정 근거는 요구하지 않습니다.

| 초기값 | 형태 |
| --- | --- |
| `localStorage` 파싱 · 인덱스 생성 · 큰 배열 정규화 | 초기화 함수로 감쌉니다 |
| 단순 숫자 · 문자열 또는 그대로 전달하는 프롭 | 감싸지 않습니다 |
| 이후 프롭스 변화를 따라가야 하는 값 | 초기 상태로 복제하지 않습니다 |

개발 환경의 `StrictMode`에서는 초기화 함수를 두 번 호출할 수 있고, 다시 마운트하면 새로 초기화합니다.
초기화 함수에 저장 · 구독 같은 부수효과를 넣지 않습니다.
`localStorage`는 클라이언트에서만 읽습니다. 서버 렌더링과 hydration에서는 서버와 최초 클라이언트 렌더가 같아야 하므로,
저장소를 읽는 시점은 화면의 클라이언트 초기화 계약을 따릅니다.

**Incorrect (무거운 초기값 계산이 렌더마다 반복됩니다):**

```tsx
const [searchIndex] = useState(toSearchIndex(product_catalog));
const [draftFilter] = useState(parseStoredProductFilter(localStorage.getItem("product-filter")));
```

**Correct (초기화 함수로 넘겨 이후 렌더에서 다시 계산하지 않습니다):**

```tsx
const [searchIndex] = useState(() => toSearchIndex(product_catalog));
// 서버 렌더링을 하지 않는 클라이언트 전용 화면에서만 저장소를 초기값으로 읽는다
const [draftFilter] = useState(() => parseStoredProductFilter(localStorage.getItem("product-filter")));
```
