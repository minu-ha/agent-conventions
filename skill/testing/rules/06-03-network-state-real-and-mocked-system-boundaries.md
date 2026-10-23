---
title: State Real and Mocked System Boundaries
titleKo: 실제 시스템과 mock의 경계를 명시합니다
impact: HIGH
impactDescription: 브라우저 테스트가 보장하는 범위와 별도 서버 검증이 필요한 범위를 구분합니다
appliesWhen:
  - 테스트의 실제 서버와 mock 경계를 정하거나 E2E, 인증, 저장 검증 범위를 설명할 때
tags: testing, network
---

## State Real and Mocked System Boundaries

**Impact: HIGH (브라우저 테스트가 보장하는 범위와 별도 서버 검증이 필요한 범위를 구분합니다)**

테스트에서 실제로 실행한 앱, 서버, 저장소, 외부 서비스를 구분합니다.
전체 앱을 연 테스트도 API를 대체했다면 실제 백엔드 인증이나 데이터 저장의 근거가 되지 않습니다.

| 검증한 경계 | 보고할 수 있는 범위 |
| --- | --- |
| 인증 응답 mock과 보호 화면 | 해당 응답에 따른 브라우저 상태와 이동 |
| 저장 응답 mock과 목록 갱신 | 요청 계약과 응답에 따른 화면 반영 |
| 실제 서버와 후속 조회 | 실제로 단언한 인증, 저장, 응답 계약 |

실제 연동이 필요한 요청이면 별도 실행 환경과 데이터를 준비합니다.
mock의 타입 일치와 실제 서버의 런타임 응답 일치는 별도로 확인합니다.

참고: [공식 문서](https://playwright.dev/docs/mock).

**Incorrect 1 (mock 실행으로 서버 인증과 저장까지 검증했다고 적습니다):**

<<< ../examples/network-state-real-and-mocked-system-boundaries/01-incorrect.txt

**Correct 1 (실행한 브라우저 범위와 남은 서버 검증을 구분합니다):**

<<< ../examples/network-state-real-and-mocked-system-boundaries/02-correct.txt
