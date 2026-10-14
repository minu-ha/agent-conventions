---
title: Keep Route Entry Files Focused on Screen Flow
titleKo: 라우트 진입 파일은 화면 흐름 조립에 집중합니다
impact: HIGH
impactDescription: 진입 파일만 봐도 화면 흐름을 따라갈 수 있습니다
appliesWhen:
  - 라우트 진입의 search 파라미터, 화면 이동, 쿼리, 뮤테이션, 화면 전체 이펙트를 옮기거나 나눌 때
  - 화면 섹션 조립의 순서나 소유자를 바꿀 때
  - 제외: 같은 소유자 안에서 표현만 바꾸는 경우
reviewWith: >-
  screen-extract-local-section-components-for-runtime-boundaries,
  ownership-place-owner-files-in-role-folders
tags: screen, routes, flow
---

## Keep Route Entry Files Focused on Screen Flow

**Impact: HIGH (진입 파일만 봐도 화면 흐름을 따라갈 수 있습니다)**

라우트 진입은 화면 흐름을 조립하고, 데이터와 동작은 사용하는 컴포넌트가 소유합니다.

### 라우트 진입의 책임

| 라우트 진입의 책임 | 범위 |
| --- | --- |
| 섹션 조립과 `Suspense` 경계 | 경계 수는 `runtime-place-suspense-boundaries-at-the-section-owner`를 따릅니다 |
| 화면 전체 이펙트 | 화면 전체에 걸친 동기화를 소유합니다 |
| 라우트 사이의 이동 흐름 결정 | `useNavigate` 호출은 실제 동작을 일으키는 컴포넌트가 맡습니다 |

### 데이터와 동작의 소유자

| 데이터, 동작 | 소유 위치 |
| --- | --- |
| 서버 응답 | 데이터를 렌더하는 컴포넌트가 같은 `key`로 직접 읽습니다 |
| 뮤테이션 | 동작을 일으키는 컴포넌트가 소유합니다 |
| 라우트 params, search 파라미터 | 사용처에서 `useParams`와 URL 파서 묶음으로 읽고 씁니다 |
| 여러 응답을 합친 파생값 | 값을 렌더하는 섹션이 인라인 `combine`을 소유합니다 |

독립 섹션이 없는 작은 화면은 진입 컴포넌트가 데이터 소유자를 겸할 수 있습니다.
이때만 쿼리를 직접 호출하고 경계는 상위 레이아웃에 두며, 경계만을 위한 빈 섹션은 만들지 않습니다.

### 같은 데이터를 여러 섹션이 읽을 때

같은 데이터가 여러 섹션에 필요해도 프롭으로 내리지 않고 각 섹션이 같은 `key`로 읽습니다.
요청이 늘면 `staleTime`, `refetchOnMount`, 실제 키를 먼저 확인합니다.
부모의 대기로 자식 요청이 늦어지면 대기 전에 실행되는 소유자에서 같은 `key`를 `usePrefetchQuery`로 먼저 요청합니다.

**Incorrect 1 (라우트 진입이 쿼리를 대신 읽어 프롭으로 내립니다):**

<<< ../examples/screen-keep-route-flow-visible/01-incorrect.tsx

**Correct 1 (라우트 진입은 섹션 조립과 경계만 맡습니다):**

<<< ../examples/screen-keep-route-flow-visible/02-correct.tsx

**Correct (섹션이 자신의 쿼리 키로 데이터를 읽고 저장까지 소유합니다):**

<<< ../examples/screen-keep-route-flow-visible/03-correct.tsx
