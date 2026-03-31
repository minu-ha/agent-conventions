# Playwright 테스트 컨벤션

## 목적
이 문서는 Playwright 기반 브라우저 테스트에서 integration과 end-to-end 범위를 명확히 나누고, setup, assertion, waiting, 데이터 고립을 일관되게 유지하기 위한 공용 기준입니다.

## 핵심 원칙
- DOM 구현 세부사항보다 사용자 관점에서 테스트합니다.
- setup, mock, auth 상태, seed 데이터를 테스트 파일에서 추적 가능하게 유지합니다.
- integration과 end-to-end는 도구가 아니라 의존 경계로 구분합니다.
- 시간보다 상태를 기다립니다.
- 공유 상태와 공유 파괴 데이터를 최소화합니다.

## 테스트 레벨
- 브라우저 UI 테스트 도구는 Playwright를 사용합니다.
- Integration 테스트는 UI 상태와 화면 로직을 빠르게 검증하기 위해 API, auth 상태, bootstrap 데이터를 제어할 수 있습니다.
- E2E 테스트는 실제 백엔드, 실제 라우팅, 실제 인증 플로우를 사용하고, 준비 단계에 한해서만 seed나 cleanup helper를 사용합니다.
- Integration과 E2E 성격을 한 파일 안에 섞지 않습니다.

## 파일명과 배치
- 파일명은 기능과 화면이 바로 보이게 짓습니다.
- 일반적으로 integration은 `*.spec.ts`, e2e는 `*.e2e.spec.ts`처럼 구분합니다.
- 여러 feature가 함께 쓰는 support 코드는 작고 명확하게 유지합니다.
- 한 feature에서만 쓰는 helper는 해당 spec 가까이에 둡니다.

## 테스트 작성 규칙
- 테스트 제목은 사용자 행동과 기대 결과가 읽히게 씁니다.
- 한 테스트는 하나의 핵심 행동에 집중합니다.
- `beforeEach`에는 정말 반복되는 준비만 둡니다.
- 새 테스트는 먼저 integration인지 e2e인지 결정하고 시작합니다.
- 테스트 데이터는 고립되게 만들고 정리합니다.

## Integration 규칙
- `page.route()`는 navigation 전에 등록합니다.
- 테스트 목적에 필요한 엔드포인트만 mock 합니다.
- loading, empty, error, success, validation, redirect, search-state 조합 같은 상태 매트릭스는 integration 범위에서 우선 검증합니다.
- 저장 흐름은 request body만이 아니라 사용자에게 보이는 결과까지 함께 검증합니다.

## E2E 규칙
- 핵심 사용자 여정은 실제 로그인, 실제 백엔드, 실제 navigation으로 검증합니다.
- 테스트의 본질이 아닌 준비 단계는 긴 UI 조작보다 API 또는 helper 기반 seed/cleanup으로 단축합니다.
- 공유 계정이나 공유 데이터를 파괴적으로 수정하는 방식은 피합니다.

## Locator, Assertion, Waiting
- role, label, visible text처럼 사용자 의미가 드러나는 locator를 우선합니다.
- 사용자에게 보이는 결과, URL 변화, 안정적인 화면 marker를 검증합니다.
- `toHaveURL`, `waitForResponse`, locator 기반 wait 같은 상태 중심 API를 우선하고 `waitForTimeout`은 피합니다.
- 시간 기반 wait가 꼭 필요하면 이유를 주석으로 남기고 범위를 좁힙니다.

## 리뷰 체크리스트
- 테스트 레벨이 실제 의존 경계와 일치하는가
- mock이 navigation 전에 명시적으로 선언되는가
- seed와 cleanup 로직이 숨지 않는가
- locator가 사용자 관점 의미를 반영하는가
- wait가 시간보다 상태를 기다리는가
