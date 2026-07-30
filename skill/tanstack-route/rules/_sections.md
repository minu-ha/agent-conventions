# 섹션

이 파일은 TanStack Route 컨벤션 rule의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Route Structure and Grouping (structure)
**TitleKo:** route 구조와 그룹화
**Impact:** CRITICAL
**Description:** layout shell 결정, root 경계, pathless grouping 규칙은 기능이 늘어나도 route tree를 예측 가능하게
  유지합니다.

## 2. File Naming and Route Assets (naming)
**TitleKo:** 파일 이름과 route 자산
**Impact:** HIGH
**Description:** 검색 가능한 entry 파일명, 의미 있는 segment 이름, 예측 가능한 route asset 세트는 route를 더 쉽게 찾고
  유지보수하게 만듭니다.

## 3. Route Definition and Navigation Boundaries (declaration)
**TitleKo:** route 선언과 내비게이션 경계
**Impact:** CRITICAL
**Description:** route 선언, redirect, guard, search 검증은 화면 안으로 새지 않고 router boundary에 명시적으로
  유지되어야 합니다.

## 4. Route-local Ownership and Responsibilities (responsibility)
**TitleKo:** route-local 소유와 책임
**Impact:** HIGH
**Description:** `layout`, `index`, `-local` 파일은 각각 좁은 책임만 가져야 route flow가 보이고 책임이 흐려지지
  않습니다.

## 5. Styles and Generated Artifacts (styling)
**TitleKo:** 스타일과 생성 산출물
**Impact:** MEDIUM-HIGH
**Description:** route 스타일은 해당 route와 함께 있어야 하고, generated router output은 derived artifact로만 유지되어야
  합니다.

## 6. Workflow and Verification (workflow)
**TitleKo:** 작업 흐름과 검증
**Impact:** MEDIUM
**Description:** 새 route 작업은 반복 가능한 setup과 review 순서를 따라야 구조, guard, router 계약을 마무리 전에 점검할
  수 있습니다.
