# Place Tests by Owner and Separate Runner Globs

**Impact: MEDIUM (테스트 위치를 예측할 수 있고 다른 러너의 파일이 잘못 실행되지 않습니다)**

함수 테스트는 대상 함수 가까이에, 화면과 여정 테스트는 소유 화면을 찾기 쉬운 위치에 둡니다.
여러 러너가 있으면 파일 이름과 수집 패턴을 함께 정해 서로의 테스트를 실행하지 않게 합니다.

| 파일 | 배치 기준 |
| --- | --- |
| 함수 테스트, 매퍼의 골든 입력 | 대상 소유자 가까이에 둡니다 |
| 화면, 앱 여정 | 프로젝트의 화면별 테스트 구조를 따릅니다 |
| fixture, story, page object, 기준값 | 사용하는 테스트의 지원 코드로 구분합니다 |

폴더 번호, 케이스 ID, 별칭, 실제 폴더 이름은 프로젝트 문서가 정합니다.
단순 이동을 이유로 무관한 테스트와 프로덕션 파일을 재배치하지 않습니다.

참고: [공식 문서](https://vitest.dev/guide/learn/testing-in-practice).

**Incorrect 1 (역할이 섞여 어떤 러너가 읽는지 알기 어렵습니다):**

```txt
test/
  format-quantity.spec.ts
  reports.spec.ts
  helpers.spec.ts

Vitest include: test/**/*.spec.ts
Playwright testMatch: test/**/*.spec.ts
```

**Correct 1 (파일 위치와 수집 범위를 함께 정합니다):**

```txt
src/util/number/format-quantity.test.ts
src/service/msw/handlers.test.ts
test/_golden/order-rows.test.ts
test/reports/reports.integration.spec.ts
test/reports/reports.e2e.spec.ts
test/_fixture/reports-page.ts

Vitest projects: unit src/**/*.test.ts, golden test/_golden/**/*.test.ts
Playwright testMatch: test/**/*.integration.spec.ts, test/**/*.e2e.spec.ts
```

> 나머지 예시와 예외는 [full rule](../rules/01-03-scope-place-tests-by-owner-and-separate-runner-globs.md)에 있습니다.
