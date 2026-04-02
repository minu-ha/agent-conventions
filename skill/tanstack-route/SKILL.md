---
name: convention-tanstack-route
description: TanStack Router file-based route, layout shell, pathless group, redirect, search param, route-local helper 규칙을 함께 적용해야 하면 사용합니다.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# TanStack Route 컨벤션

에이전트 협업 팀을 위한 TanStack Router 컨벤션 모음입니다. 현재 이 가이드는 6개 카테고리의 24개 규칙으로 구성되어 있으며, route 구조, 네이밍, router boundary 선언, route-local 책임, generated artifact, 반복 가능한 route 추가 워크플로우를 `rules/*.md`와 compiled `AGENTS.md`로 관리합니다.

## 사용할 때
- TanStack Router route 파일, route 폴더, route 인접 `*.ts` helper를 만들거나 수정할 때 사용합니다.
- `createFileRoute`, `beforeLoad`, `validateSearch`, pathless group, 동적 세그먼트, route grouping 규칙이 중요한 변경에 사용합니다.
- route 구조나 redirect/guard 동작을 house style 기준으로 리뷰할 때 사용합니다.

## 우선순위별 규칙 카테고리

| 우선순위 | 카테고리 | 영향도 | Prefix |
|----------|----------|--------|--------|
| 1 | Route Structure and Grouping | CRITICAL | `structure-` |
| 2 | File Naming and Route Assets | HIGH | `naming-` |
| 3 | Route Definition and Navigation Boundaries | CRITICAL | `declaration-` |
| 4 | Route-local Ownership and Responsibilities | HIGH | `responsibility-` |
| 5 | Styles and Generated Artifacts | MEDIUM-HIGH | `styling-` |
| 6 | Workflow and Verification | MEDIUM | `workflow-` |

## 빠른 참조

### 1. Route Structure and Grouping (CRITICAL)

- `structure-keep-root-responsibilities-in-root-route` - 앱 전역 관심사는 `__root.tsx`에 유지
- `structure-split-top-level-route-groups-by-layout-shell` - 최상위 route group은 layout shell 기준으로 분리
- `structure-avoid-folder-only-and-flat-only-route-trees` - 폴더, group, feature entry 이름을 적절히 혼합
- `structure-use-parentheses-folders-for-pathless-route-groups` - pathless grouping에는 `()` 폴더 사용
- `structure-keep-shared-layout-screens-under-one-parent-layout` - 같은 shell을 쓰는 화면은 하나의 parent layout 아래 유지

### 2. File Naming and Route Assets (HIGH)

- `naming-prepare-the-basic-route-file-set` - CSS, helper, layout, index 파일을 함께 준비
- `naming-use-searchable-feature-route-file-names` - entry 파일명은 feature 기준으로 검색 가능하게 유지
- `naming-start-child-route-sets-with-parentheses-folders` - 중첩 route set은 group 폴더로 시작
- `naming-use-domain-specific-dynamic-segment-names` - generic id보다 의미 있는 param 이름 사용
- `naming-create-route-local-helper-files-early` - 같은 레벨 `*.ts` helper 파일을 초기에 확보
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
- `responsibility-place-route-only-modules-in-local` - route 전용 helper와 UI는 `-local/`에 저장

### 5. Styles and Generated Artifacts (MEDIUM-HIGH)

- `styling-keep-route-css-at-route-scope` - route CSS는 해당 route 소유 scope에 유지
- `styling-never-edit-generated-route-tree-files` - generated route tree 파일은 derived artifact로 취급

### 6. Workflow and Verification (MEDIUM)

- `workflow-add-new-routes-in-layout-first-order` - 새 route는 layout-first 순서로 추가
- `workflow-review-route-structure-before-finishing` - 마무리 전 route checklist로 구조 점검

## 함께 쓰기
- route entry 화면이나 `-local` 컴포넌트가 바뀌면 `convention-react`를 함께 사용합니다.
- route helper, search schema, 정규화 로직이 바뀌면 `convention-typescript`를 함께 사용합니다.
- route 레벨 CSS나 `-local/*.css`가 바뀌면 `convention-css`를 함께 사용합니다.
- redirect, auth guard, navigation 흐름을 Playwright로 검증하면 `convention-playwright-test`를 함께 사용합니다.

## 사용하는 방법

자세한 설명과 코드 예시는 개별 rule 파일을 읽으면 됩니다.

```text
rules/declaration-validate-search-before-using-route-search.md
rules/structure-split-top-level-route-groups-by-layout-shell.md
```

각 rule 파일에는 아래 내용이 들어 있습니다.
- 규칙이 왜 중요한지에 대한 짧은 설명
- 설명이 붙은 Incorrect 코드 또는 폴더 예시
- 설명이 붙은 Correct 코드 또는 폴더 예시
- 구현이나 리뷰에 바로 적용할 수 있는 가이드

## 전체 compiled 문서

모든 규칙이 펼쳐진 전체 가이드는 `./AGENTS.md`에서 확인할 수 있습니다.
