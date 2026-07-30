# 섹션

이 파일은 Playwright Test 컨벤션 rule의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Strategy and Test Levels (strategy)
**TitleKo:** 전략과 테스트 층위
**Impact:** CRITICAL
**Description:** 도구 선택, 테스트 레벨 분류, 파일 분리 규칙은 브라우저 테스트에서 무엇이 mock이고 무엇이 real인지
  분명하게 유지해야 합니다.

## 2. File Placement and Shared Support (naming)
**TitleKo:** 파일 배치와 공용 support
**Impact:** HIGH
**Description:** spec 배치, 파일명, shared support 승격 규칙은 테스트 소유권을 찾기 쉽게 만들고 support 코드 규모를
  적절하게 유지해야 합니다.

## 3. General Authoring and Data Isolation (authoring)
**TitleKo:** 작성 규칙과 데이터 격리
**Impact:** HIGH
**Description:** 테스트 제목, setup 가시성, 데이터 고립, comment 규칙은 spec를 읽기 쉽게 하고 실패 원인을 진단 가능하게
  유지해야 합니다.

## 4. Integration Boundaries and Mocking (integration)
**TitleKo:** integration 경계와 모킹
**Impact:** CRITICAL
**Description:** integration 테스트는 mocked dependency를 명시적으로 드러내고, 상태 조합을 커버하며, 시간 대신 관찰
  가능한 상태를 기다려야 합니다.

## 5. E2E Boundaries and Real-system Control (e2e)
**TitleKo:** e2e 경계와 실제 시스템 제어
**Impact:** CRITICAL
**Description:** e2e 테스트는 실제 backend와 auth 경로를 사용하되 seed, cleanup, shared resource 위험을 의도적으로
  통제해야 합니다.

## 6. Locators, Assertions, and Waiting (locator)
**TitleKo:** 로케이터·단정·대기
**Impact:** HIGH
**Description:** 브라우저 테스트는 접근 가능한 locator, web-first assertion, 실제 비동기 경계에만 쓰는 explicit
  waiting을 우선해야 합니다.

## 7. Guardrails and Review Checks (guardrails)
**TitleKo:** 가드레일과 마무리 점검
**Impact:** MEDIUM
**Description:** 마무리 전에는 테스트 레벨 의미를 흐리거나 flaky 브라우저 테스트를 만드는 shortcut을 기준으로 다시
  점검해야 합니다.
