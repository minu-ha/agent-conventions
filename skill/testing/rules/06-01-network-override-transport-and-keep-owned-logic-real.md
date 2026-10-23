---
title: Override Transport and Keep Owned Logic Real
titleKo: 응답 경계에서 교체하고 화면의 실제 처리를 유지합니다
impact: HIGH
impactDescription: 요청 조립과 응답 변환, provider, 화면 상태의 실제 연결을 확인합니다
appliesWhen:
  - 화면 테스트의 API mock, 응답 덮어쓰기, 요청 본문 단언을 추가하거나 바꿀 때
tags: testing, network
---

## Override Transport and Keep Owned Logic Real

**Impact: HIGH (요청 조립과 응답 변환, provider, 화면 상태의 실제 연결을 확인합니다)**

화면 상태를 검증할 때는 네트워크 경계에서 필요한 응답만 교체합니다.
화면의 hook, 응답 매퍼, provider를 대체하거나 DOM을 직접 써서 기대 화면을 만들지 않습니다.

기본 응답과 케이스별 덮어쓰기를 구분하고 덮어쓰기는 요청이 시작되기 전에 등록합니다.
요청의 필드와 헤더가 계약이면 직접 단언하고 화면 결과가 계약이면 그 결과까지 확인합니다.
기존 프로젝트의 mock 통로를 사용하며 특정 생성기나 폴더 구성을 공통 요구사항으로 삼지 않습니다.

service worker와 page.route가 동시에 있으면 어느 쪽이 요청을 처리하는지 확인합니다.
page.route로 제어할 프로젝트는 service worker 차단 등 실제 가로채기 경계를 맞춥니다.

참고: [공식 문서](https://playwright.dev/docs/network).

**Incorrect 1 (응답 처리 대신 DOM에 기대 문구를 직접 씁니다):**

<<< ../examples/network-override-transport-and-keep-owned-logic-real/01-incorrect.test.ts

**Correct 1 (API 응답을 바꾸고 실제 화면의 표시를 확인합니다):**

<<< ../examples/network-override-transport-and-keep-owned-logic-real/02-correct.test.ts
