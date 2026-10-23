---
title: Share Handlers across Browser and Node
titleKo: 같은 handler를 브라우저와 Node의 단일 응답 경계로 연결합니다
impact: HIGH
impactDescription: 실행 환경에 따라 정상 데이터와 handler 우선순위가 달라지는 문제를 막습니다
appliesWhen:
  - MSW worker, Node bridge, mockApi fixture의 handler 공유와 우선순위를 만들거나 바꿀 때
requiresSelected: network-detect-unhandled-api-requests, data-isolate-and-restore-test-state
tags: testing, network, msw, playwright
---

## Share Handlers across Browser and Node

**Impact: HIGH (실행 환경에 따라 정상 데이터와 handler 우선순위가 달라지는 문제를 막습니다)**

브라우저 mock과 Node 테스트는 같은 소유 handler registry를 가져옵니다.
응답 본문을 환경마다 복사하지 않고 어느 실행 경로가 요청을 처리하는지 하나로 정합니다.

| 소비 환경 | 연결 방식 |
| --- | --- |
| 개발, mock 앱 E2E | mock 모드에서 setupWorker에 공유 registry를 연결합니다 |
| Node 함수 통합 | setupServer에 같은 registry를 연결합니다 |
| 브라우저 story 통합 | SW를 차단하고 page.route에서 getResponse로 registry를 해석합니다 |

Node bridge는 메서드, URL, 헤더, 요청 본문과 응답 상태, 헤더, 본문을 보존합니다.
cookie를 생략하는 headers 대신 allHeaders를 사용하고 상대 handler의 baseUrl도 맞춥니다.
여러 Set-Cookie는 getSetCookie로 읽고 Playwright가 받는 줄바꿈 구분으로 모두 전달합니다.
처리되지 않은 API 요청은 실패로 연결하고, 실제 호출 허용 목록만 명시적으로 통과시킵니다.
passthrough를 무조건 네트워크로 보내지 않고 프로젝트의 실제 호출 계약을 확인합니다.

worker의 요청 거부나 오류 로그만으로 mock 앱 E2E가 실패한다고 가정하지 않습니다.
미처리 API를 구별할 표식을 기록하고 실행 fixture가 테스트 종료 때 누락을 단언합니다.
화면이 fetch 실패를 처리하거나 다른 화면으로 이동해도 기록이 사라지지 않게 합니다.

case handler는 기본 handler보다 먼저 해석하고 요청 시작 전에 등록합니다.
handler 목록과 가로채기는 테스트마다 만들고 종료 시 해제합니다.
배열 복사는 handler 인스턴스의 상태를 초기화하지 않습니다.
공유 기본 registry는 상태 없는 반복 응답으로 한정합니다.
once, generator, 변경 가능한 저장소가 필요하면 테스트마다 factory에서 새 인스턴스를 만듭니다.
context를 재사용하면 cache, storage, 앱 전역 상태의 초기화도 별도로 확인합니다.
브라우저 clock은 Node builder의 시간이나 난수 상태까지 바꾸지 않으므로 입력을 함께 전달합니다.

참고: [MSW getResponse](https://mswjs.io/api/get-response),
[Playwright의 service worker와 네트워크](https://playwright.dev/docs/network),
[Playwright의 다중 cookie 표현](https://playwright.dev/docs/api/class-response#response-header-value).

**Incorrect 1 (Node registry와 별개인 목록을 브라우저에서 다시 작성합니다):**

<<< ../examples/network-share-handlers-across-browser-and-node/01-incorrect.ts

**Correct 1 (공유 registry를 mock 모드의 브라우저 worker에 연결합니다):**

<<< ../examples/network-share-handlers-across-browser-and-node/05-correct.ts
<<< ../examples/network-share-handlers-across-browser-and-node/02-correct.ts

**Correct (Node bridge가 요청과 응답을 보존하고 미처리 API를 거부합니다):**

<<< ../examples/network-share-handlers-across-browser-and-node/03-correct.ts

**Correct (fixture가 테스트별 우선순위와 가로채기 수명을 소유합니다):**

<<< ../examples/network-share-handlers-across-browser-and-node/04-correct.ts

**Correct (화면이 실패 응답을 처리해도 미처리 API 기록으로 mock 앱 E2E를 실패시킵니다):**

<<< ../examples/network-share-handlers-across-browser-and-node/06-correct.ts
