---
name: convention-tanstack-route
description: Use when editing TanStack Router file-based routes, route folders, layout shells, guards, redirects, search params, or route-local support modules.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# TanStack Route 컨벤션

에이전트 협업 팀을 위한 TanStack Router 컨벤션 모음입니다. 현재 이 가이드는 6개 카테고리의 24개 local 규칙으로 구성되어 있습니다.
route 구조, 네이밍, router boundary 선언, route-local 책임, generated artifact, 반복 가능한 route 추가 워크플로우를 [rules/_sections.md](./rules/_sections.md), [rules/_template.md](./rules/_template.md), `rules/*.md`와 compiled [HANDBOOK.md](./HANDBOOK.md)로 관리합니다.
기본 compiled guide는 local router rule만 담고 route support module과 search schema에는 `convention-typescript`를 companion skill로 함께 사용합니다.
이 skill은 TanStack Router의 mixed route tree와 프로젝트의 custom route naming 전제를 함께 따릅니다. 특히 `routeToken: "layout"`과 feature-named `*.layout.tsx` / `*.index.tsx` 파일 세트를 전제로 설명합니다.

## 사용할 때
- TanStack Router route 파일, route 폴더, route 인접 owner-named `*.ts` support module을 만들거나 수정할 때 사용합니다.
- `createFileRoute`, `beforeLoad`, `validateSearch`, pathless group, 동적 세그먼트, route grouping 규칙이 중요한 변경에 사용합니다.
- route 구조나 redirect/guard 동작을 house style 기준으로 리뷰할 때 사용합니다.

## 활성화 체크리스트
- 변경 범위가 route 파일, route 폴더 구조, redirect/guard/search schema, route-local support module인지 먼저 확인합니다.
- 이 skill이 활성화되면 먼저 compiled [HANDBOOK.md](./HANDBOOK.md)를 열어 Structure, Naming, Declaration, Responsibility, Styling, Workflow 중 어떤 카테고리가 직접 걸리는지 빠르게 훑습니다.
- 실제로 바꾸는 관심사에 맞는 `rules/*.md`를 추가로 읽습니다. route 구조와 그룹핑을 바꾸면 structure rule, `createFileRoute`/`beforeLoad`/`validateSearch`를 바꾸면 declaration rule, CSS와 generated artifact를 만지면 styling/workflow rule을 확인합니다.
- route support module과 search schema를 바꾸면 `convention-typescript`, route entry 화면이나 `-local` UI를 바꾸면 `convention-react`, route CSS를 바꾸면 `convention-css`, navigation 검증을 브라우저 테스트로 확인하면 `convention-playwright-test`도 함께 로드합니다.

## 우선순위별 규칙 카테고리

1. Route Structure and Grouping
   영향도: CRITICAL
   Prefix: `structure-`
2. File Naming and Route Assets
   영향도: HIGH
   Prefix: `naming-`
3. Route Definition and Navigation Boundaries
   영향도: CRITICAL
   Prefix: `declaration-`
4. Route-local Ownership and Responsibilities
   영향도: HIGH
   Prefix: `responsibility-`
5. Styles and Generated Artifacts
   영향도: MEDIUM-HIGH
   Prefix: `styling-`
6. Workflow and Verification
   영향도: MEDIUM
   Prefix: `workflow-`

## 빠른 참조

### 1. Route Structure and Grouping (CRITICAL)

- `structure-keep-root-responsibilities-in-root-route` - 앱 전역 관심사는 `__root.tsx`에 유지
- `structure-split-top-level-route-groups-by-layout-shell` - 최상위 route group은 layout shell 기준으로 분리
- `structure-avoid-folder-only-and-flat-only-route-trees` - 폴더, group, feature entry 이름을 적절히 혼합
- `structure-use-parentheses-folders-for-pathless-route-groups` - pathless grouping에는 `()` 폴더 사용
- `structure-keep-shared-layout-screens-under-one-parent-layout` - 같은 shell을 쓰는 화면은 하나의 parent layout 아래 유지

### 2. File Naming and Route Assets (HIGH)

- `naming-prepare-the-basic-route-file-set` - CSS, support module, layout, index 4-file set을 먼저 준비
- `naming-use-searchable-feature-route-file-names` - entry 파일명은 feature 기준으로 검색 가능하게 유지
- `naming-start-child-route-sets-with-parentheses-folders` - 중첩 route set은 group 폴더로 시작
- `naming-use-domain-specific-dynamic-segment-names` - generic id보다 의미 있는 param 이름 사용
- `naming-create-route-local-helper-files-early` - generic helper 파일 대신 owner-named route support module을 사용
- `naming-name-top-level-groups-by-shell-meaning` - 최상위 group은 shell 의미 기준으로 이름 지정

### 3. Route Definition and Navigation Boundaries (CRITICAL)

- `declaration-export-route-at-file-top` - 각 route 파일 상단에 `Route` export 선언
- `declaration-match-route-paths-to-file-structure` - `createFileRoute()` 문자열은 파일 구조와 정렬
- `declaration-redirect-empty-entry-routes-in-beforeload` - 빈 entry route는 `beforeLoad`에서 redirect
- `declaration-run-auth-and-permission-guards-in-beforeload` - guard는 router boundary에 유지
- `declaration-validate-search-before-using-route-search` - search는 `validateSearch`에서 정규화
- `declaration-read-params-and-search-from-local-route` - params와 search는 local `Route`에서 읽기

### 4. Route-local Ownership and Responsibilities (HIGH)

- `responsibility-limit-layout-files-to-shell-concerns` - `*.layout.tsx`는 shell 관심사에 집중
- `responsibility-keep-index-files-focused-on-screen-flow` - `*.index.tsx`는 screen flow에 집중
- `responsibility-place-route-only-modules-in-local` - route 전용 UI와 private module은 `-local/`에 저장

### 5. Styles and Generated Artifacts (MEDIUM-HIGH)

- `styling-keep-route-css-at-route-scope` - route CSS는 해당 route 소유 scope에 유지
- `styling-never-edit-generated-route-tree-files` - generated route tree 파일은 derived artifact로 취급

### 6. Workflow and Verification (MEDIUM)

- `workflow-add-new-routes-in-layout-first-order` - 새 route는 layout-first 순서로 추가
- `workflow-review-route-structure-before-finishing` - 마무리 전 route checklist로 구조 점검

## 함께 쓰기
- 이 skill은 route support module, search schema, route-local `*.ts` 변경 시 `convention-typescript`와 함께 로드하는 것을 기본으로 합니다.
- slim [HANDBOOK.md](./HANDBOOK.md)는 local router rule만 담고, route support module과 search schema의 공통 TypeScript 규칙은 `convention-typescript`를 함께 로드해 보완합니다.
- route entry 화면이나 `-local` 컴포넌트가 바뀌면 `convention-react`를 함께 사용합니다.
- route 레벨 CSS나 `-local/*.css`가 바뀌면 `convention-css`를 함께 사용합니다.
- redirect, auth guard, navigation 흐름을 Playwright로 검증하면 `convention-playwright-test`를 함께 사용합니다.

## 마무리 전 셀프 리뷰
- 이번 변경이 Structure, Declaration, Responsibility, Styling, Workflow 중 어느 카테고리에 걸리는지 다시 대조하고 관련 rule을 빠뜨리지 않았는지 확인합니다.
- route support/search schema, route UI, route CSS, Playwright 검증까지 번졌는데 `convention-typescript`, `convention-react`, `convention-css`, `convention-playwright-test`를 누락하지 않았는지 점검합니다.
- route path 문자열, 파일 구조, guard/search 정규화, generated artifact 취급이 모두 router 규칙과 맞는지 마지막으로 확인합니다.

## 사용하는 방법

자세한 설명과 코드 예시는 개별 rule 파일을 읽으면 됩니다.

- [rules/declaration-validate-search-before-using-route-search.md](./rules/declaration-validate-search-before-using-route-search.md)
- [rules/structure-split-top-level-route-groups-by-layout-shell.md](./rules/structure-split-top-level-route-groups-by-layout-shell.md)

각 rule 파일에는 아래 내용이 들어 있습니다.
- 규칙이 왜 중요한지에 대한 짧은 설명
- 설명이 붙은 Incorrect 코드 또는 폴더 예시
- 설명이 붙은 Correct 코드 또는 폴더 예시
- 구현이나 리뷰에 바로 적용할 수 있는 가이드

## 전체 compiled 문서

모든 규칙이 펼쳐진 전체 가이드는 [HANDBOOK.md](./HANDBOOK.md)에서 확인할 수 있습니다.
