---
name: convention-playwright-test
description: Playwright 브라우저 테스트, integration/e2e 경계, locator 전략, waiting, mocking, 데이터 고립 규칙을 함께 적용해야 하면 사용합니다.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# Playwright Test 컨벤션

에이전트 협업 팀을 위한 Playwright 브라우저 테스트 컨벤션 모음입니다. 현재 이 가이드는 7개 카테고리의 25개 local 규칙으로 구성되어 있습니다.  
테스트 레벨 경계, spec 배치, setup 가시성, 데이터 고립, locator 전략, waiting 규칙을 `rules/*.md`와 compiled `AGENTS.md`로 관리합니다.  
compiled guide에는 fixture, seed helper, support type에 공통으로 적용되는 `convention-typescript` base rule이 함께 포함됩니다.

## 사용할 때
- Playwright spec, feature-local helper, 공용 support 파일을 만들거나 수정할 때 사용합니다.
- Integration과 E2E 범위를 의도적으로 나누고, locator, mocking, seed, cleanup, waiting 규칙을 일관되게 유지해야 할 때 사용합니다.
- 브라우저 테스트 house style 기준으로 테스트 코드를 리뷰할 때 사용합니다.

## 우선순위별 규칙 카테고리

| 우선순위 | 카테고리 | 영향도 | Prefix |
|----------|----------|--------|--------|
| 1 | Strategy and Test Levels | CRITICAL | `strategy-` |
| 2 | File Placement and Shared Support | HIGH | `naming-` |
| 3 | General Authoring and Data Isolation | HIGH | `authoring-` |
| 4 | Integration Boundaries and Mocking | CRITICAL | `integration-` |
| 5 | E2E Boundaries and Real-system Control | CRITICAL | `e2e-` |
| 6 | Locators, Assertions, and Waiting | HIGH | `locator-` |
| 7 | Guardrails and Review Checks | MEDIUM | `guardrails-` |

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
- 이 skill의 compiled guide는 `convention-typescript` base rule을 함께 포함합니다.
  SKILL.md만 읽는 환경이라면 fixture, seed helper, payload builder 변경 시
  `convention-typescript`도 함께 로드합니다.
- 테스트가 화면 구조나 라우팅 규칙과 강하게 묶이면 `convention-react`나 `convention-tanstack-route`를 함께 사용합니다.

## 사용하는 방법

자세한 설명과 코드 예시는 개별 rule 파일을 읽으면 됩니다.

```text
rules/strategy-never-mix-integration-and-e2e-in-one-file.md
rules/locator-prefer-accessible-playwright-locators.md
```

각 rule 파일에는 아래 내용이 들어 있습니다.
- 규칙이 왜 중요한지에 대한 짧은 설명
- 설명이 붙은 Incorrect 테스트 예시
- 설명이 붙은 Correct 테스트 예시
- 구현이나 리뷰에 바로 적용할 수 있는 가이드

## 전체 compiled 문서

모든 규칙이 펼쳐진 전체 가이드는 `./AGENTS.md`에서 확인할 수 있습니다.
