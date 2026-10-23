# 섹션

이 파일은 테스트 컨벤션 규칙의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Test Scope and Ownership (scope)
**TitleKo:** 범위와 배치
**Impact:** HIGH
**Description:** 검증할 계약에 맞는 가장 작은 실행 범위를 고르고 층별 책임과 소유 위치를 정합니다.
프로젝트의 테스트 추가 정책과 러너 수집 경계를 유지합니다.

## 2. Scenarios and Expectations (case)
**TitleKo:** 시나리오와 기대값
**Impact:** HIGH
**Description:** GIVEN, WHEN, THEN으로 조건, 행동, 결과를 드러내고 상태와 경계값을 선택합니다.
기대값은 검증 대상 구현과 독립된 계약에서 정합니다.

## 3. Test Data and Isolation (data)
**TitleKo:** 데이터와 격리
**Impact:** HIGH
**Description:** 유효한 입력의 핵심 필드를 명시하고 시간과 실행 환경을 통제합니다.
테스트가 바꾼 상태와 자원의 수명을 격리하고 복구합니다.

## 4. Vitest Assertions and Mocking (vitest)
**TitleKo:** Vitest 단언과 mock
**Impact:** HIGH
**Description:** 값, 오류, 비동기 완료를 계약에 맞는 matcher로 확인합니다.
검증 대상은 실제로 실행하고 필요한 의존 경계만 대체합니다.

## 5. Playwright Browser Tests (playwright)
**TitleKo:** Playwright 브라우저 테스트
**Impact:** HIGH
**Description:** 의미와 범위가 분명한 locator로 준비된 화면을 조작합니다.
조건과 이벤트로 기다리고 fixture와 page object는 실제 반복 경계에 맞춥니다.

## 6. Network Boundaries (network)
**TitleKo:** 네트워크 경계
**Impact:** HIGH
**Description:** 실제 화면 처리와 provider는 유지하며 응답 경계에서 필요한 상태를 만듭니다.
생성 계약과 소유 mock을 조립해 브라우저와 Node가 함께 쓰고 미처리 요청을 검출합니다.

## 7. Golden and Visual Baselines (baseline)
**TitleKo:** 골든과 시각 비교
**Impact:** HIGH
**Description:** 의미 있는 차이를 유지하는 작은 기준값을 검토합니다.
시각 비교의 렌더 환경, 안정화 조건, matcher 설정을 맞춥니다.

## 8. Verification and Reporting (verification)
**TitleKo:** 검증과 결과 보고
**Impact:** HIGH
**Description:** 회귀 테스트가 원래 결함을 검출하는지 확인하고 실행 범위를 기록합니다.
실패, 재시도 통과, 미실행과 커버리지의 측정 경계를 보존합니다.

## 9. Stories and Harnesses (story)
**TitleKo:** Story와 harness
**Impact:** HIGH
**Description:** 실제 화면과 provider로 재현 가능한 상태를 만들고 story를 테스트에서 소비합니다.
브라우저 경계의 props, 콜백, 정리와 자동 단언의 책임을 구분합니다.
