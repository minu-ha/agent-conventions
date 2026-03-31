# TanStack Route 컨벤션

## 목적
이 문서는 TanStack Router 파일 기반 라우팅에서 route 구조, 파일 네이밍, search param 처리, route 로컬 경계를 일관되게 유지하기 위한 공용 기준입니다.

## 핵심 원칙
- 기능보다 layout shell을 기준으로 route를 그룹화합니다.
- route 파일은 이름만으로 찾기 쉬워야 합니다.
- redirect, guard, validated search state는 router 경계에서 처리합니다.
- layout shell 책임과 화면 조립 책임을 분리합니다.
- 생성된 route 산출물은 수동으로 수정하지 않습니다.

## 구조
- root route는 정말 전역적인 책임만 가집니다.
- 최상위 route group은 기능명이 아니라 layout shell 차이를 기준으로 나눕니다.
- 깊은 `index.tsx` 중첩이나 지나치게 긴 플랫 파일명 한쪽으로 치우치지 말고, 실제 폴더, pathless group 폴더, 설명적인 파일명을 섞어 씁니다.
- 같은 layout shell을 공유하는 화면은 같은 부모 layout 아래에 둡니다.

## 파일 네이밍
- `feature.index.tsx`, `feature.layout.tsx`처럼 검색 가능한 이름을 사용합니다.
- 파일 검색이 어려워지는 일반적인 `index.tsx`, `layout.tsx` 남용은 피합니다.
- URL 세그먼트를 늘리지 않고 묶기만 해야 하는 계층은 `(feature)` 같은 pathless group 폴더를 사용합니다.
- route 전용 helper는 해당 route 엔트리와 같은 계층의 `.ts` 파일에 둡니다.
- 해당 route만 아는 private 컴포넌트나 helper는 프로젝트에서 정한 route 로컬 폴더에 둡니다.

## Router API
- 각 route 파일 상단 가까이에 `export const Route`를 둡니다.
- 기본 redirect, auth guard, router 경계 판단은 `beforeLoad`에서 처리합니다.
- search param을 읽기 전에 `validateSearch`를 정의합니다.
- 임의 prop 전달보다 `Route.useParams()`, `Route.useSearch()`를 우선합니다.

## 파일 책임
- `layout` 파일은 공통 shell 구조, guard, outlet 조합을 담당합니다.
- `index` 파일은 해당 route의 실제 화면 조립을 담당합니다.
- route 로컬 폴더에는 다른 route에서 import하면 안 되는 컴포넌트, 상수, helper를 둡니다.

## 스타일과 생성 파일
- route 레벨 스타일과 route 로컬 컴포넌트 스타일을 분리합니다.
- route tree 같은 생성 산출물은 수동으로 수정하지 않습니다.

## 리뷰 체크리스트
- route tree가 layout shell 기준으로 설계되었는가
- 엔트리 파일명이 기능명으로 검색 가능한가
- route 로컬 로직이 소유 route 근처에 있는가
- search param이 사용 전에 검증되는가
- redirect와 guard가 router 경계에 있는가
