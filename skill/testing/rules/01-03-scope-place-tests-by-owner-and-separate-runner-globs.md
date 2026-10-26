---
title: Place Tests by Owner and Separate Runner Globs
titleKo: 소유 대상을 찾기 쉽게 배치하고 러너 수집 범위를 분리합니다
impact: MEDIUM
impactDescription: 테스트 위치를 예측할 수 있고 다른 러너의 파일이 잘못 실행되지 않습니다
appliesWhen:
  - 테스트 파일, fixture, story의 위치나 이름을 정하거나 러너의 수집 패턴을 바꿀 때
tags: testing, scope
---

## Place Tests by Owner and Separate Runner Globs

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

<<< ../examples/scope-place-tests-by-owner-and-separate-runner-globs/01-incorrect.txt

**Correct 1 (파일 위치와 수집 범위를 함께 정합니다):**

<<< ../examples/scope-place-tests-by-owner-and-separate-runner-globs/02-correct.txt
