---
name: convention-playwright-test
description: Use when writing or reviewing Playwright browser tests, deciding integration versus e2e boundaries, locator and waiting strategy, mocking, seed data, or cleanup flow.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# Playwright Test 컨벤션

에이전트 협업 팀을 위한 Playwright 브라우저 테스트 컨벤션 모음입니다. 현재 이 가이드는 7개 카테고리의 25개 local 규칙으로 구성되어 있습니다.
테스트 레벨 경계, spec 배치, setup 가시성, 데이터 고립, locator 전략, waiting 규칙을 [rules/_sections.md](./rules/_sections.md), [rules/_template.md](./rules/_template.md), `rules/*.md`와 compiled [HANDBOOK.md](./HANDBOOK.md)로 관리합니다.
기본 compiled guide는 local Playwright rule만 담고 fixture, seed helper, support type에는 `convention-typescript`를 companion skill로 함께 사용합니다.

## 사용할 때
- Playwright spec, feature-local helper, 공용 support 파일을 만들거나 수정할 때 사용합니다.
- Integration과 E2E 범위를 의도적으로 나누고, locator, mocking, seed, cleanup, waiting 규칙을 일관되게 유지해야 할 때 사용합니다.
- 브라우저 테스트 house style 기준으로 테스트 코드를 리뷰할 때 사용합니다.

## 활성화 체크리스트
- 변경 범위가 Playwright spec, fixture, seed helper, support type, integration/e2e 분류, locator, mocking, waiting 규칙에 걸리는지 먼저 확인합니다.
- 이 skill이 활성화되면 먼저 compiled [HANDBOOK.md](./HANDBOOK.md)를 열어 Strategy, Naming, Authoring, Integration, E2E, Locator, Guardrails 중 어떤 카테고리가 직접 관련되는지 빠르게 훑습니다.
- 실제로 바꾸는 관심사에 맞는 `rules/*.md`를 추가로 읽습니다. integration/e2e 분류를 바꾸면 strategy/integration/e2e rule, locator나 assertion을 바꾸면 locator rule, test data와 cleanup을 바꾸면 authoring rule을 확인합니다.
- fixture, seed helper, payload builder, support type을 건드리면 `convention-typescript`를 함께 로드하고, 화면 구조나 route 흐름이 직접 관련되면 `convention-react`나 `convention-tanstack-route`도 같이 참고합니다.

## 우선순위별 규칙 카테고리

1. Strategy and Test Levels
   영향도: CRITICAL
   Prefix: `strategy-`
2. File Placement and Shared Support
   영향도: HIGH
   Prefix: `naming-`
3. General Authoring and Data Isolation
   영향도: HIGH
   Prefix: `authoring-`
4. Integration Boundaries and Mocking
   영향도: CRITICAL
   Prefix: `integration-`
5. E2E Boundaries and Real-system Control
   영향도: CRITICAL
   Prefix: `e2e-`
6. Locators, Assertions, and Waiting
   영향도: HIGH
   Prefix: `locator-`
7. Guardrails and Review Checks
   영향도: MEDIUM
   Prefix: `guardrails-`

## 빠른 참조

### 1. Strategy and Test Levels (CRITICAL)

- `strategy-use-playwright-as-the-single-browser-ui-tool` - 브라우저 UI 테스트 도구는 Playwright 하나로 통일
- `strategy-default-to-integration-plus-minimal-e2e` - integration에서 상태 범위를 넓게 커버하고 e2e는 최소 핵심 흐름만 유지
- `strategy-keep-vitest-out-of-browser-ui-tests` - 브라우저 UI 테스트에 Vitest를 기본 도구로 섞지 않음
- `strategy-classify-integration-tests-by-mocked-dependency-boundary` - integration 테스트는 mocked dependency boundary 기준으로 분류
- `strategy-classify-e2e-tests-by-real-backend-and-auth` - e2e 테스트는 실제 backend/auth 의존 기준으로 분류
- `strategy-never-mix-integration-and-e2e-in-one-file` - 하나의 spec 파일에 integration과 e2e를 섞지 않음

### 2. File Placement and Shared Support (HIGH)

- `naming-place-specs-by-feature-path` - spec는 feature path 기준으로 배치
- `naming-use-discoverable-spec-file-names` - feature 기준으로 찾기 쉬운 spec 파일명 사용
- `naming-promote-shared-support-only-after-real-reuse` - 실제 재사용이 생긴 뒤에만 shared support로 승격

### 3. General Authoring and Data Isolation (HIGH)

- `authoring-name-tests-by-user-action-and-result` - 테스트 이름은 사용자 행동과 결과 기준으로 작성
- `authoring-keep-one-behavior-per-test` - 테스트 하나당 하나의 동작만 검증
- `authoring-keep-beforeeach-limited-and-visible` - `beforeEach`는 제한적으로 사용하고 숨기지 않음
- `authoring-isolate-and-clean-up-test-data` - 테스트 데이터는 고립시키고 명시적으로 정리
- `authoring-follow-the-integration-or-e2e-first-writing-sequence` - integration/e2e 선언 순서를 먼저 따름
- `authoring-write-comments-only-for-non-obvious-setup-boundaries` - comment는 비자명한 setup 경계에만 작성

### 4. Integration Boundaries and Mocking (CRITICAL)

- `integration-mock-only-the-endpoints-required-by-the-spec` - spec에 필요한 endpoint만 mock
- `integration-cover-state-matrices-and-user-visible-results` - integration에서는 상태 조합과 사용자 가시 결과를 커버
- `integration-wait-for-state-not-time` - integration 테스트에서는 시간보다 상태를 기다림

### 5. E2E Boundaries and Real-system Control (CRITICAL)

- `e2e-use-real-backend-auth-and-routing` - e2e에서는 실제 backend, auth, routing 사용
- `e2e-seed-with-api-helpers-and-clean-up-in-finally` - API helper로 seed하고 `finally`에서 정리
- `e2e-avoid-destructive-shared-account-scenarios-and-parallel-collisions` - 파괴적인 shared account 시나리오와 병렬 충돌 회피

### 6. Locators, Assertions, and Waiting (HIGH)

- `locator-prefer-accessible-playwright-locators` - 접근 가능한 Playwright locator 우선
- `locator-use-web-first-assertions-for-ui-results` - UI 결과는 web-first assertion으로 검증
- `locator-allow-explicit-waits-only-for-real-async-boundaries` - explicit wait는 실제 async 경계에만 허용

### 7. Guardrails and Review Checks (MEDIUM)

- `guardrails-review-banned-playwright-shortcuts-before-finishing` - 마무리 전에 금지 Playwright shortcut 점검

## 함께 쓰기
- 이 skill은 fixture, seed helper, payload builder, support type 변경 시 `convention-typescript`와 함께 로드하는 것을 기본으로 합니다.
- slim [HANDBOOK.md](./HANDBOOK.md)는 local Playwright rule만 담고, fixture나 support type의 공통 TypeScript 규칙은 `convention-typescript`를 함께 로드해 보완합니다.
- 테스트가 화면 구조나 라우팅 규칙과 강하게 묶이면 `convention-react`나 `convention-tanstack-route`를 함께 사용합니다.

## 마무리 전 셀프 리뷰
- 이번 테스트 변경이 integration, e2e, locator, authoring 중 어느 축에 걸리는지 다시 대조하고 관련 rule을 빠뜨리지 않았는지 확인합니다.
- fixture/support type, 화면 구조, 라우팅 흐름이 함께 바뀌는데 `convention-typescript`, `convention-react`, `convention-tanstack-route` 같은 companion skill을 빼먹지 않았는지 점검합니다.
- 시간 대기 대신 상태 대기를 쓰는지, integration과 e2e를 한 파일에 섞지 않았는지, seed/cleanup 경계가 명확한지 마지막으로 확인합니다.

## 사용하는 방법

자세한 설명과 코드 예시는 개별 rule 파일을 읽으면 됩니다.

- [rules/strategy-never-mix-integration-and-e2e-in-one-file.md](./rules/strategy-never-mix-integration-and-e2e-in-one-file.md)
- [rules/locator-prefer-accessible-playwright-locators.md](./rules/locator-prefer-accessible-playwright-locators.md)

각 rule 파일에는 아래 내용이 들어 있습니다.
- 규칙이 왜 중요한지에 대한 짧은 설명
- 설명이 붙은 Incorrect 테스트 예시
- 설명이 붙은 Correct 테스트 예시
- 구현이나 리뷰에 바로 적용할 수 있는 가이드

## 전체 compiled 문서

모든 규칙이 펼쳐진 전체 가이드는 [HANDBOOK.md](./HANDBOOK.md)에서 확인할 수 있습니다.
