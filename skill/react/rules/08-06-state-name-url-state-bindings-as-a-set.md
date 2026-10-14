---
title: Name URL State Bindings as a Set
titleKo: URL 파서, 파싱 결과, 플랫폼 객체의 이름을 구분합니다
impact: MEDIUM
impactDescription: 주소가 소유한 상태, 플랫폼 객체, 서버 응답이 이름만으로 구분됩니다
appliesWhen:
  - 라우트 search 파라미터를 읽거나 쓰는 바인딩을 추가, 변경할 때
  - search 파라미터 파서 묶음을 만들거나 옮길 때
  - 제외: 서버 요청 쿼리, 뮤테이션 바인딩만 바꾸는 경우
requiresSelected: typescript/naming-place-owner-constants-in-the-owner-constant-folder
reviewWith: state-choose-state-tools-by-source-of-truth
tags: state, naming, url
---

## Name URL State Bindings as a Set

**Impact: MEDIUM (주소가 소유한 상태, 플랫폼 객체, 서버 응답이 이름만으로 구분됩니다)**

라우트 search 파라미터는 파싱 전 원본, 파싱 결과, 서버 응답이 구분되도록 이름을 고정합니다.

| 대상 | 이름과 위치 |
| --- | --- |
| 파라미터별 파싱 함수 묶음 | `<범위>UrlParsers`. 화면의 URL 계약이므로 소유자 `_constant`에 둡니다 |
| 파싱 결과와 갱신 함수 | `urlParams`, `setUrlParams` |
| 플랫폼 `URLSearchParams` 객체 | `searchParams`. 파싱 결과에는 쓰지 않습니다 |

`query`가 들어간 이름은 `data-name-query-and-mutation-bindings-consistently`에 따라 서버 요청 바인딩에만 씁니다.
값을 주소에 둘지는 `state-choose-state-tools-by-source-of-truth`로 판단합니다.

**Incorrect 1 (파서 묶음의 역할이 이름에 드러나지 않습니다):**

<<< ../examples/state-name-url-state-bindings-as-a-set/01-incorrect.ts

**Correct 1 (파서 묶음은 `<범위>UrlParsers`로 소유자 `_constant` 폴더에 둡니다):**

<<< ../examples/state-name-url-state-bindings-as-a-set/02-correct.ts

**Incorrect 2 (파싱 결과에 플랫폼 객체와 서버 요청용 이름을 섞어 씁니다):**

<<< ../examples/state-name-url-state-bindings-as-a-set/03-incorrect.tsx

**Correct 2 (파싱을 거친 값은 `urlParams`이고 별칭 없이 체인으로 읽습니다):**

<<< ../examples/state-name-url-state-bindings-as-a-set/04-correct.tsx

**Correct (플랫폼 `URLSearchParams` 객체만 `searchParams`입니다):**

<<< ../examples/state-name-url-state-bindings-as-a-set/05-correct.tsx
