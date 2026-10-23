---
title: Detect Unhandled API Requests
titleKo: mock에서 빠진 API 요청을 검출합니다
impact: HIGH
impactDescription: 누락된 mock이 외부 네트워크나 무관한 기본 응답으로 숨지 않습니다
appliesWhen:
  - mock 서버의 미처리 요청 정책, route fallback, handler 우선순위를 추가하거나 바꿀 때
tags: testing, network
---

## Detect Unhandled API Requests

**Impact: HIGH (누락된 mock이 외부 네트워크나 무관한 기본 응답으로 숨지 않습니다)**

mock으로 검증하는 API 요청은 처리 누락이 드러나게 설정합니다.
정적 자원이나 명시적으로 실제 호출할 경로는 허용 목록으로 구분하고 전체 우회를 기본값으로 숨기지 않습니다.

handler의 매칭 조건과 우선순위, 테스트별 덮어쓰기의 초기화를 확인합니다.
미처리 요청의 오류 로그만으로 테스트 실패가 보장된다고 가정하지 않고 실행 결과에 연결되는지도 확인합니다.
page.route의 fallback은 앞서 등록된 handler로 넘기는 용도와 실제 네트워크로 빠지는 경우를 구분합니다.

참고: [공식 문서](https://mswjs.io/guides/best-practices/avoid-request-assertions).

**Incorrect 1 (처리되지 않은 API 요청을 모두 우회합니다):**

<<< ../examples/network-detect-unhandled-api-requests/01-incorrect.test.ts

**Correct 1 (미처리 요청을 오류로 드러내고 handler 수명을 정리합니다):**

<<< ../examples/network-detect-unhandled-api-requests/02-correct.test.ts
