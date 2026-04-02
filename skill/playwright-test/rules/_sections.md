# Sections

이 파일은 Playwright test convention rule들의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Strategy and Test Levels (strategy)
**Impact:** CRITICAL
**Description:** Tool choice, level classification, and file-level separation should keep browser tests explicit about what is mocked and what is real.

## 2. File Placement and Shared Support (naming)
**Impact:** HIGH
**Description:** Spec placement, file names, and shared support promotion should keep test ownership discoverable and support code proportional.

## 3. General Authoring and Data Isolation (authoring)
**Impact:** HIGH
**Description:** Test titles, setup visibility, data isolation, and comment rules should keep specs readable and failures diagnosable.

## 4. Integration Boundaries and Mocking (integration)
**Impact:** CRITICAL
**Description:** Integration tests should make mocked dependencies explicit, cover state matrices, and wait on observable state instead of time.

## 5. E2E Boundaries and Real-system Control (e2e)
**Impact:** CRITICAL
**Description:** E2E tests should use real backend and auth paths while controlling seed, cleanup, and shared-resource risks intentionally.

## 6. Locators, Assertions, and Waiting (locator)
**Impact:** HIGH
**Description:** Browser tests should prefer accessible locators, web-first assertions, and explicit waiting only for real asynchronous boundaries.

## 7. Guardrails and Review Checks (guardrails)
**Impact:** MEDIUM
**Description:** Before finishing, test changes should be checked against the shortcuts that most often blur level meaning or create flaky browser tests.
