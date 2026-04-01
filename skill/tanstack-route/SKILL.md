---
name: convention-tanstack-route
description: TanStack Router 파일 기반 route, route 그룹, layout-index 경계, search param, redirect, route 로컬 helper를 수정할 때 사용합니다.
---

# TanStack Route 컨벤션

## 사용할 때
- TanStack Router route 파일이나 route 폴더를 만들거나 수정할 때 사용합니다.
- `beforeLoad`, `validateSearch`, `Route.useParams()`, `Route.useSearch()` 동작이 바뀔 때 사용합니다.
- route grouping, layout shell, route 로컬 helper 배치가 바뀔 때 사용합니다.

## 함께 읽을 것
- 상세 규칙은 `./tanstack-route.md`를 읽습니다.
- 화면 조립과 컴포넌트 경계는 `convention-react`를 함께 사용합니다.
- route 스타일과 로컬 스타일은 `convention-css`를 함께 사용합니다.
- helper 모듈과 공용 유틸은 `convention-typescript`를 함께 사용합니다.

## 중점 확인 항목
- layout 기준 route grouping
- 검색 가능한 파일명
- search param 검증과 router API 사용
- route 로컬 소유 경계
- 생성 파일 보호

## 리뷰 체크리스트
- route grouping이 기능 분리보다 layout shell 기준을 따르는가
- 엔트리 파일명이 검색 가능하고 설명적인가
- redirect와 guard가 화면 본문이 아니라 router 경계에 있는가
- search param이 사용 전에 검증되는가
- 생성된 route 산출물을 직접 수정하지 않았는가
