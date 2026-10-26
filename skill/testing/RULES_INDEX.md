# Testing 컨벤션 Rule Index

- Skill: `testing`
- Routing digest: `sha256:ef6a840802c3b30ab89fe93bc7d75f9ea20af47f43bf82e77d5ff1176c28e5ba`

## Direct Companions

- `css` (`conditional`) · Applies when: 테스트 대상이나 harness의 스타일시트, 클래스 계약, 토큰을 실제로 변경한다. · [SKILL.md](../css/SKILL.md) · [RULES_INDEX.md](../css/RULES_INDEX.md)
- `react` (`conditional`) · Applies when: story, 테스트 harness의 React 렌더, 상태, provider 구성을 실제로 변경한다. · [SKILL.md](../react/SKILL.md) · [RULES_INDEX.md](../react/RULES_INDEX.md)
- `typescript` (`required`) · [SKILL.md](../typescript/SKILL.md) · [RULES_INDEX.md](../typescript/RULES_INDEX.md)

## Local Rules

- T01-01 | scope-choose-the-smallest-reliable-boundary | 새 테스트의 실행 환경이나 단위, 통합, E2E 범위를 정할 때. 제외: 기존 테스트의 기대 문구만 고치는 경우.
- T01-02 | scope-assign-a-primary-layer-and-check-wiring | 같은 기능의 단위, 통합, E2E 테스트 책임을 나누거나 중복을 정리할 때.
- T01-03 | scope-place-tests-by-owner-and-separate-runner-globs | 테스트 파일, fixture, story의 위치나 이름을 정하거나 러너의 수집 패턴을 바꿀 때.
- T01-04 | scope-separate-test-level-from-suite-purpose | smoke, sanity, regression의 선정 기준, 태그, 실행 명령을 정하거나 바꿀 때.
- T02-01 | case-describe-one-observable-behavior | 테스트 제목, 본문 구간, describe, step을 추가하거나 시나리오를 나눌 때.
- T02-02 | case-cover-relevant-states-and-boundaries | 새 기능의 테스트 사례를 고르거나 입력 범위, 비동기 상태, 오류 처리를 변경할 때.
- T02-03 | case-derive-expectations-from-independent-contracts | 기대값을 추가, 변경하거나 테스트 안에서 기대 결과를 계산할 때.
- T03-01 | data-build-small-valid-typed-fixtures | 테스트 데이터, 응답 생성기, fixture 타입과 덮어쓰기 값을 추가하거나 바꿀 때.
- T03-02 | data-control-time-randomness-and-environment | 테스트 결과가 현재 시각, 난수, 타임존, 로케일, viewport에 의존하도록 추가하거나 바꿀 때.
- T03-03 | data-isolate-and-restore-test-state | 공유 context, 저장소, 캐시, mock, 타이머, 구독의 생성이나 초기화, 종료를 바꿀 때.
- T04-01 | vitest-assert-values-errors-and-async-completion | Vitest 단언, 예외 검사, Promise 반환이나 비동기 테스트 본문을 추가, 변경할 때.
- T04-02 | vitest-mock-dependencies-without-replacing-the-subject | Vitest의 모듈 mock, spy, 의존성 주입을 추가하거나 mock 범위를 바꿀 때.
- T05-01 | playwright-use-semantic-and-scoped-locators | Playwright의 요소 탐색, 필터, 클릭 대상 locator를 추가하거나 바꿀 때.
- T05-02 | playwright-wait-for-state-and-register-events-before-actions | 브라우저 테스트의 대기, 상태 단언, 요청, 다운로드, 팝업 이벤트 검사를 바꿀 때.
- T05-03 | playwright-share-fixtures-and-page-objects-at-real-boundaries | Playwright fixture, page object, 공통 준비 helper를 만들거나 공유 범위를 바꿀 때.
- T05-04 | playwright-prepare-state-and-exercise-the-target-journey | 브라우저 테스트의 초기 URL, 인증 준비, 이동 경로, 업로드나 다운로드 여정을 바꿀 때.
- T06-01 | network-override-transport-and-keep-owned-logic-real | 화면 테스트의 API mock, 응답 덮어쓰기, 요청 본문 단언을 추가하거나 바꿀 때.
- T06-02 | network-detect-unhandled-api-requests | mock 서버의 미처리 요청 정책, route fallback, handler 우선순위를 추가하거나 바꿀 때.
- T06-03 | network-state-real-and-mocked-system-boundaries | 테스트의 실제 서버와 mock 경계를 정하거나 E2E, 인증, 저장 검증 범위를 설명할 때.
- T06-04 | network-compose-generated-contracts-through-owned-builders | API 생성기의 DTO, faker, MSW 산출물을 연결하거나 그 위의 소유 mock을 조립할 때.
- T06-05 | network-share-handlers-across-browser-and-node | MSW worker, Node bridge, mockApi fixture의 handler 공유와 우선순위를 만들거나 바꿀 때.
- T07-01 | baseline-keep-snapshots-stable-small-and-reviewed | JSON 골든, snapshot, serializer, 기준값 갱신을 추가하거나 바꿀 때.
- T07-02 | baseline-align-visual-environment-and-matcher-options | 이미지 기준값, 캡처 대상, 렌더 안정화, 비교 허용치나 matcher 설정을 바꿀 때.
- T08-01 | verification-prove-regressions-detect-the-original-failure | 버그 재현 테스트를 추가하거나 기존 실패 테스트와 기준값을 수정할 때.
- T08-02 | verification-report-failures-flakes-and-executed-scope | 테스트 실행 결과, 커버리지, skip, retry, 결과서와 CI 종료 코드를 추가하거나 바꿀 때.
- T09-01 | story-compose-owned-state-with-real-providers | story export, harness의 provider, 초기 라우트, props와 콜백 구성을 만들거나 바꿀 때.
- T09-02 | story-verify-states-through-consuming-tests | story를 mount하는 통합 spec, gallery 실행 설정, 상태별 자동 단언을 만들거나 바꿀 때. | reviewWith: story-compose-owned-state-with-real-providers