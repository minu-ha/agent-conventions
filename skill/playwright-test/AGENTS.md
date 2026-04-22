# Playwright Test 컨벤션

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 4월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.extends`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=playwright-test`로 다시 생성하세요.

---

## 개요

에이전트 협업 팀을 위한 Playwright 브라우저 테스트 컨벤션입니다. 이 가이드는 명시적인 integration/e2e 경계, 보이는 setup, 결정적인 데이터 고립, 접근 가능한 locator, web-first assertion, 상태 기반 waiting을 강조합니다. `rules/` 아래 rule 파일이 source of truth이며, 기본 compiled guide는 local Playwright 규칙만 담고 fixture, seed helper, support type에는 `typescript` companion skill을 함께 사용합니다.

이 가이드는 local Playwright Test 컨벤션 규칙만 담고 있습니다. 공통 규칙은 companion skill을 함께 로드해 보완합니다.

---

## 함께 로드할 Companion Skill

- `convention-typescript` - TypeScript Convention 공통 규칙 guide: [TypeScript Convention](../typescript/AGENTS.md)

---

## 목차

1. [Strategy and Test Levels](#1-strategy-and-test-levels) — **CRITICAL**
    - 1.1 [Classify E2E Tests by Real Backend and Auth Dependence](#11-classify-e2e-tests-by-real-backend-and-auth-dependence)
    - 1.2 [Classify Integration Tests by Mocked Dependency Boundary](#12-classify-integration-tests-by-mocked-dependency-boundary)
    - 1.3 [Default to Integration Plus Minimal Critical E2E](#13-default-to-integration-plus-minimal-critical-e2e)
    - 1.4 [Keep Vitest Out of Browser UI Tests by Default](#14-keep-vitest-out-of-browser-ui-tests-by-default)
    - 1.5 [Never Mix Integration and E2E in One File](#15-never-mix-integration-and-e2e-in-one-file)
    - 1.6 [Use Playwright as the Single Browser UI Tool](#16-use-playwright-as-the-single-browser-ui-tool)
2. [File Placement and Shared Support](#2-file-placement-and-shared-support) — **HIGH**
    - 2.1 [Place Specs by Feature Path](#21-place-specs-by-feature-path)
    - 2.2 [Promote Shared Support Only After Real Reuse](#22-promote-shared-support-only-after-real-reuse)
    - 2.3 [Use Discoverable Spec File Names](#23-use-discoverable-spec-file-names)
3. [General Authoring and Data Isolation](#3-general-authoring-and-data-isolation) — **HIGH**
    - 3.1 [Follow the Declared Integration or E2E Writing Sequence](#31-follow-the-declared-integration-or-e2e-writing-sequence)
    - 3.2 [Isolate and Clean Up Test Data](#32-isolate-and-clean-up-test-data)
    - 3.3 [Keep beforeEach Limited and Visible](#33-keep-beforeeach-limited-and-visible)
    - 3.4 [Keep One Behavior Per Test](#34-keep-one-behavior-per-test)
    - 3.5 [Name Tests by User Action and Result](#35-name-tests-by-user-action-and-result)
    - 3.6 [Write Comments Only for Non-obvious Setup Boundaries](#36-write-comments-only-for-non-obvious-setup-boundaries)
4. [Integration Boundaries and Mocking](#4-integration-boundaries-and-mocking) — **CRITICAL**
    - 4.1 [Cover State Matrices and User-visible Results in Integration](#41-cover-state-matrices-and-user-visible-results-in-integration)
    - 4.2 [Mock Only the Endpoints Required by the Spec](#42-mock-only-the-endpoints-required-by-the-spec)
    - 4.3 [Wait for State, Not Time, in Integration Tests](#43-wait-for-state-not-time-in-integration-tests)
5. [E2E Boundaries and Real-system Control](#5-e2e-boundaries-and-real-system-control) — **CRITICAL**
    - 5.1 [Avoid Destructive Shared-account Scenarios and Parallel Collisions](#51-avoid-destructive-shared-account-scenarios-and-parallel-collisions)
    - 5.2 [Seed With API Helpers and Clean Up in finally](#52-seed-with-api-helpers-and-clean-up-in-finally)
    - 5.3 [Use Real Backend, Auth, and Routing in E2E](#53-use-real-backend-auth-and-routing-in-e2e)
6. [Locators, Assertions, and Waiting](#6-locators-assertions-and-waiting) — **HIGH**
    - 6.1 [Allow Explicit Waits Only for Real Async Boundaries](#61-allow-explicit-waits-only-for-real-async-boundaries)
    - 6.2 [Prefer Accessible Playwright Locators](#62-prefer-accessible-playwright-locators)
    - 6.3 [Use Web-first Assertions for UI Results](#63-use-web-first-assertions-for-ui-results)
7. [Guardrails and Review Checks](#7-guardrails-and-review-checks) — **MEDIUM**
    - 7.1 [Review Banned Playwright Shortcuts Before Finishing](#71-review-banned-playwright-shortcuts-before-finishing)

---

## 1. Strategy and Test Levels

**Impact: CRITICAL**

도구 선택, 테스트 레벨 분류, 파일 분리 규칙은 브라우저 테스트에서 무엇이 mock이고 무엇이 real인지 분명하게 유지해야 합니다.

### 1.1 Classify E2E Tests by Real Backend and Auth Dependence

**Impact: CRITICAL (keeps e2e meaning strict by requiring the real backend, real auth, and real routing to remain part of the test)**

실제 로그인, 실제 저장, 실제 권한 연결이 끊기면 테스트 의미가 사라지면 E2E입니다. E2E는 실제 백엔드, 실제 인증 플로우, 실제 라우팅과 번들 결과를 사용하고, 핵심 엔드포인트를 `page.route()`로 가로채면서 E2E라고 부르지 않습니다.

**Incorrect (실제 시스템 경계를 우회하면서 E2E라고 분류):**

```txt
- 로그인 성공 응답을 route mocking
- 저장 API도 route mocking
- 파일명은 *.e2e.spec.ts
```

**Correct (실제 백엔드와 인증이 의미의 일부일 때만 E2E):**

```txt
- 파일 기준: <test-root>/**/*.e2e.spec.ts
- 실제 백엔드 사용
- 실제 인증 사용
- 실제 저장/권한/라우팅 보증
```

### 1.2 Classify Integration Tests by Mocked Dependency Boundary

**Impact: CRITICAL (makes it clear that integration tests exercise UI and route behavior with mocked backend or auth boundaries)**

주요 API를 mock해도 테스트 목적이 유지되면 Integration입니다. Integration은 `page.route()` 기반 API mocking, 인증 상태 mocking, 초기 데이터 강제 주입을 허용하고, 폼 검증, 로딩/에러/빈 상태, 권한 redirect, search/pagination 동기화 같은 화면 조합 책임을 검증합니다.

**Incorrect (mock을 적극적으로 쓰면서도 E2E라고 부름):**

```txt
- page.route()로 핵심 API 응답을 모두 가로채고
- 권한 상태도 강제 주입하지만
- 파일명은 *.e2e.spec.ts
```

**Correct (의존 경계가 mock이면 Integration으로 분류):**

```txt
- 파일 기준: <test-root>/**/*.spec.ts
- API mocking, auth mocking 허용
- 목적: 상태 분기와 사용자 반응 검증
```

### 1.3 Default to Integration Plus Minimal Critical E2E

**Impact: HIGH (keeps state coverage broad without duplicating every branch in slower real-system tests)**

새 기능은 기본적으로 Integration에서 상태 분기와 화면 반응을 먼저 잡고, 필요한 최소 핵심 사용자 흐름만 E2E로 남깁니다. 모든 상태 조합을 E2E로 복제하지 않고, 실제 끝까지 되는지 보장해야 하는 핵심 여정만 E2E에 둡니다.

**Incorrect (모든 상태 조합을 E2E로 복제):**

```txt
- loading / error / empty / success 모두 E2E만 작성
- 실제 로그인/실제 저장 여부와 무관한 분기까지 E2E로 중복
```

**Correct (상태 분기는 Integration, 핵심 여정은 최소 E2E):**

```txt
- 폼 validation, 권한 redirect, empty/error/success 매트릭스 -> Integration
- 실제 로그인 성공, 실제 저장 smoke -> E2E
```

### 1.4 Keep Vitest Out of Browser UI Tests by Default

**Impact: MEDIUM-HIGH (avoids splitting browser UI coverage across tools when Playwright already owns the runtime boundary)**

`vi`와 `Vitest`는 이 프로젝트의 기본 UI 테스트 도구가 아닙니다. 화면이나 라우트 기능 검증을 위해 Vitest를 기본 도입하지 않고, DOM 없이 검증하는 편이 더 싼 순수 계산 로직이 충분히 생겼을 때만 별도 합의 후 검토합니다.

**Incorrect (브라우저 UI 검증에 Vitest를 기본 도입):**

```txt
- 화면 상호작용 검증을 Vitest DOM 테스트로 기본 작성
- 같은 UI 경계를 Playwright와 Vitest가 나눠 가짐
```

**Correct (브라우저 UI는 Playwright가 기본값):**

```txt
- UI/라우트 기능 검증 -> Playwright
- 순수 계산/formatter/helper만 정말 필요할 때 별도 도구 검토
```

### 1.5 Never Mix Integration and E2E in One File

**Impact: HIGH (keeps test intent and failure diagnosis clear by assigning one runtime boundary per spec file)**

한 spec 파일 안에는 하나의 테스트 레벨만 둡니다. Integration과 E2E는 도구가 아니라 의존 경계로 구분되므로, 한 파일 안에서 mock 기반 테스트와 실제 시스템 기반 테스트를 섞지 않습니다.

**Incorrect (한 파일 안에서 Integration과 E2E를 섞음):**

```ts
test("mocked validation error", async ({page}) => {
	// integration
});

test("real login smoke", async ({page}) => {
	// e2e
});
```

**Correct (레벨마다 파일을 분리):**

```txt
login.spec.ts
login.e2e.spec.ts
```

### 1.6 Use Playwright as the Single Browser UI Tool

**Impact: CRITICAL (keeps browser UI testing consistent by using one toolchain and one interaction model across test levels)**

브라우저 UI 테스트의 기본 도구는 `Playwright` 하나로 통일합니다. 같은 도구를 쓰더라도 Integration과 E2E 경계는 별도로 나누고, locator, assertion, waiting 방식도 Playwright의 web-first 문법으로 통일합니다.

**Incorrect (브라우저 UI 테스트 도구가 섞임):**

```txt
- 일부 화면은 Playwright
- 일부 화면은 다른 브라우저 테스트 도구
- 수준별 문법과 waiting 방식이 제각각
```

**Correct (브라우저 테스트는 Playwright 하나로 통일):**

```txt
- Playwright Integration
- Playwright E2E
- locator / assertion / waiting 모두 Playwright web-first 패턴 사용
```

## 2. File Placement and Shared Support

**Impact: HIGH**

spec 배치, 파일명, shared support 승격 규칙은 테스트 소유권을 찾기 쉽게 만들고 support 코드 규모를 적절하게 유지해야 합니다.

### 2.1 Place Specs by Feature Path

**Impact: HIGH (keeps test ownership discoverable by mirroring the real route or feature path in the test tree)**

테스트는 `<test-root>/<기능 경로>/...` 아래에 두고, 디렉터리 구조는 실제 화면이나 도메인 구조를 따라갑니다. 그래야 feature를 찾을 때 구현 파일과 테스트 파일이 비슷한 경로 감각으로 탐색됩니다.

**Incorrect (기능 구조와 무관한 한 폴더에 spec를 몰아넣음):**

```txt
<test-root>/
  all/
    login.spec.ts
    members.spec.ts
    project.spec.ts
```

**Correct (기능 경로를 반영해 배치):**

```txt
<test-root>/login/login.spec.ts
<test-root>/login/login.e2e.spec.ts
<test-root>/project/members/members.form.{-$mid}.spec.ts
<test-root>/project/members/members.e2e.spec.ts
```

### 2.2 Promote Shared Support Only After Real Reuse

**Impact: MEDIUM-HIGH (keeps support layers proportional by delaying global helpers until multiple features genuinely need them)**

전역 공용 helper는 `<test-support-path>`에 두되, 여러 feature가 함께 쓰는 인증, API seed, 공용 route setup만 올립니다. 특정 기능 하나에서만 쓰는 mock builder, request body helper, bootstrap wait는 spec 근처에 두고, 공용화는 두 개 이상 feature에서 반복될 때만 합니다.

**Incorrect (한 기능 전용 helper를 너무 빨리 전역 support로 올림):**

```txt
<test-support-path>/members-form-mock.ts
<test-support-path>/project-members-route-body.ts
```

**Correct (실제 재사용 전에는 feature 근처에 유지):**

```txt
<test-support-path>/support.ts  // 인증, 공용 seed, 공용 route setup
<test-root>/project/members/members.mock.ts  // feature local helper
```

### 2.3 Use Discoverable Spec File Names

**Impact: HIGH (keeps spec purpose searchable by encoding feature and level directly into the filename)**

Integration은 `*.spec.ts`, E2E는 `*.e2e.spec.ts`를 사용하고, 파일명에는 라우트나 기능 이름이 바로 보이게 유지합니다. `index.spec.ts`, `test.spec.ts`처럼 탐색이 어려운 이름은 금지합니다.

**Incorrect (파일명만 봐서는 기능과 레벨이 보이지 않음):**

```txt
index.spec.ts
test.spec.ts
members.test.ts
```

**Correct (기능과 레벨이 즉시 보임):**

```txt
login.spec.ts
login.e2e.spec.ts
members.form.{-$mid}.spec.ts
members.e2e.spec.ts
```

## 3. General Authoring and Data Isolation

**Impact: HIGH**

테스트 제목, setup 가시성, 데이터 고립, comment 규칙은 spec를 읽기 쉽게 하고 실패 원인을 진단 가능하게 유지해야 합니다.

### 3.1 Follow the Declared Integration or E2E Writing Sequence

**Impact: MEDIUM (reduces confused setup by forcing the author to classify the test level and dependency boundary before writing actions)**

신규 테스트를 쓸 때는 먼저 Integration인지 E2E인지 결정하고, 그 레벨에 맞는 setup만 선언한 뒤, 사용자 locator로 action을 작성하고, web-first assertion으로 결과를 검증합니다. 마지막으로 정말 필요한 비동기 경계만 명시적으로 기다립니다.

**Incorrect (레벨 구분 없이 test body부터 쓰기 시작):**

```txt
1. 일단 page.goto()부터 작성
2. 중간에 route mocking과 실제 로그인 helper를 같이 추가
3. 나중에 파일명을 *.spec.ts 또는 *.e2e.spec.ts로 고민
```

**Correct (레벨을 먼저 고정하고 그 경계에 맞게 작성):**

```txt
1. 먼저 Integration인지 E2E인지 결정
2. 의존 경계에 맞는 setup만 선언
3. 사용자 locator로 action 작성
4. web-first assertion으로 결과 검증
5. 필요한 비동기 경계만 상태 기반으로 대기
```

### 3.2 Isolate and Clean Up Test Data

**Impact: HIGH (prevents remote or shared-state browser tests from colliding through reused accounts, ids, or seed records)**

원격 백엔드를 건드리는 테스트는 고유 데이터로 실행하고 `try/finally`로 cleanup합니다. `Date.now()`, worker suffix, 고유 login ID 같은 전략으로 충돌을 피하고, 공용 관리자 계정이나 고정 ID를 파괴적으로 수정하는 테스트는 만들지 않습니다.

**Incorrect (공유 데이터에 파괴적으로 의존):**

```txt
- 공용 관리자 계정의 이름을 수정
- 고정 멤버 ID를 테스트마다 덮어씀
- cleanup 없이 seed 데이터만 생성
```

**Correct (고립된 데이터 생성과 명시적 정리):**

```ts
const loginId = `pw.${Date.now()}@example.com`;

try {
	await support.members.createMemberViaApi({loginId});
	// test body
} finally {
	await support.members.deleteMemberViaApi({loginId});
}
```

### 3.3 Keep beforeEach Limited and Visible

**Impact: HIGH (prevents shared setup from hiding the test's real dependency boundary or main assertions)**

`beforeEach`에는 반복되는 인증 stub, 공용 이동 경로, 공용 seed 설치처럼 진짜 반복되는 준비만 둡니다. 핵심 assertion이나 테스트마다 다른 mock/seed를 `beforeEach`에 숨기지 않고, 각 테스트 본문에서 선언합니다.

**Incorrect (`beforeEach`에 테스트 의미를 숨김):**

```ts
test.beforeEach(async ({page}) => {
	await page.route("/api/members", async (route) => {
		await route.fulfill({body: JSON.stringify({list: []})});
	});
	await expect(page.getByText("비어 있음")).toBeVisible();
});
```

**Correct (공통 준비만 `beforeEach`에 두고 목적별 설정은 test body에서 선언):**

```ts
test.beforeEach(async ({page}) => {
	await support.route.setupAuthenticatedSession(page);
});

test("검색 결과가 비어 있으면 empty 상태를 보여준다", async ({page}) => {
	await page.route("/api/members", async (route) => {
		await route.fulfill({body: JSON.stringify({list: []})});
	});
});
```

### 3.4 Keep One Behavior Per Test

**Impact: HIGH (keeps setup, action, and assertions focused so browser failures point to one behavior instead of many unrelated checks)**

한 테스트는 한 행동과 한 결과에 집중합니다. 기본 구조는 `Arrange -> Act -> Assert` 순서를 따르고, unrelated assertion을 한 테스트 안에 과도하게 나열하지 않습니다.

**Incorrect (여러 행동과 결과를 한 test에 밀어 넣음):**

```ts
test("목록 조회와 생성과 삭제가 모두 동작한다", async ({page}) => {
	// 너무 많은 행동과 assertion
});
```

**Correct (행동과 결과를 하나로 좁힘):**

```ts
test("저장 후 성공 토스트를 표시한다", async ({page}) => {
	// 한 행동 + 한 핵심 결과
});
```

### 3.5 Name Tests by User Action and Result

**Impact: MEDIUM-HIGH (makes browser tests readable as user behavior instead of implementation detail or setup jargon)**

`test.describe()`는 기능 단위 이름을 쓰고, `test()` 제목은 “사용자 행동 + 기대 결과” 형태로 작성합니다. 구현 세부사항이나 내부 state가 아니라 사용자가 보는 결과가 읽혀야 합니다.

**Incorrect (구현 세부사항이나 setup 중심 제목):**

```ts
test("calls members API and updates state", async ({page}) => {});
test("test 1", async ({page}) => {});
```

**Correct (행동과 결과가 함께 드러나는 제목):**

```ts
test("저장 버튼을 누르면 성공 토스트를 표시한다", async ({page}) => {});
test("권한이 없으면 멤버 화면 진입 시 로그인으로 이동한다", async ({page}) => {});
```

### 3.6 Write Comments Only for Non-obvious Setup Boundaries

**Impact: MEDIUM (keeps test comments focused on why a setup exists instead of narrating obvious Arrange/Act/Assert steps)**

테스트 주석은 한글로 작성하고, helper, seed/cleanup, bootstrap wait처럼 목적이 바로 드러나지 않는 setup에만 왜 필요한지 짧게 남깁니다. 코드 그대로를 반복 설명하거나 Arrange/Act/Assert를 줄마다 해설하는 과한 단계 주석은 기본값으로 쓰지 않습니다.

**Incorrect (코드 그대로를 반복 설명):**

```ts
// 저장 버튼을 클릭한다.
await page.getByRole("button", {name: "저장"}).click();
```

**Correct (비자명한 경계에만 이유를 설명):**

```ts
// bootstrap query가 끝나기 전에는 폼 필드가 비활성이라 안정적인 marker를 먼저 기다린다.
await expect(page.getByRole("heading", {name: "멤버 생성"})).toBeVisible();
```

## 4. Integration Boundaries and Mocking

**Impact: CRITICAL**

integration 테스트는 mocked dependency를 명시적으로 드러내고, 상태 조합을 커버하며, 시간 대신 관찰 가능한 상태를 기다려야 합니다.

### 4.1 Cover State Matrices and User-visible Results in Integration

**Impact: HIGH (keeps integration tests responsible for the wide UI state matrix and the visible result of each state)**

Integration은 상태 매트릭스를 책임집니다. loading, empty, error, success, validation error, permission redirect, search/pagination 동기화를 우선 검토하고, submit 계열 테스트는 request body 검증만으로 끝내지 말고 저장 후 URL, 토스트, 화면 전환 같은 사용자 결과도 함께 확인합니다.

**Incorrect (request body만 보고 사용자 결과는 보지 않음):**

```ts
test("저장 요청 body를 보낸다", async ({page}) => {
	// request payload만 확인하고 끝냄
});
```

**Correct (상태와 사용자 결과를 함께 검증):**

```ts
test("저장 후 목록 화면으로 이동하고 성공 토스트를 표시한다", async ({page}) => {
	// payload 검증 + URL/토스트/화면 변화 확인
});
```

### 4.2 Mock Only the Endpoints Required by the Spec

**Impact: HIGH (keeps integration test setup readable by mocking only the dependencies that matter to the scenario)**

Integration에서 `page.route()`는 반드시 `page.goto()` 전에 등록하고, 해당 테스트 목적에 필요한 엔드포인트만 선언합니다. 인증이 필요하면 공용 authenticated session helper를 우선 사용하고, 어디서 무엇이 응답되는지 spec에서 바로 읽을 수 있어야 합니다.

**Incorrect (무관한 엔드포인트까지 넓게 mock):**

```ts
test("멤버 검색", async ({page}) => {
	await page.route("**/*", async (route) => {
		await route.fulfill({body: "{}"});
	});
});
```

**Correct (필요한 경계만 명시적으로 mock):**

```ts
test("멤버 검색 결과를 표시한다", async ({page}) => {
	await support.route.setupAuthenticatedSession(page);
	await page.route("**/api/members?keyword=kim", async (route) => {
		await route.fulfill({body: JSON.stringify({list: [{name: "Kim"}]})});
	});
});
```

### 4.3 Wait for State, Not Time, in Integration Tests

**Impact: CRITICAL (keeps integration tests deterministic by waiting for observable state instead of arbitrary sleeps)**

Integration에서는 Suspense, bootstrap query, lazy data 주입이 있는 화면일수록 관련 응답이나 안정적인 화면 marker가 생긴 뒤 assertion을 시작합니다. `waitForTimeout()` 대신 URL, response, locator 상태 같은 관찰 가능한 상태를 기다립니다.

**Incorrect (시간 기반 안정화):**

```ts
await page.waitForTimeout(1000);
await expect(page.getByText("완료")).toBeVisible();
```

**Correct (상태를 기다린 뒤 검증):**

```ts
await expect(page).toHaveURL(/members/);
await page.waitForResponse(/api\/members/);
await expect(page.getByRole("heading", {name: "멤버"})).toBeVisible();
```

## 5. E2E Boundaries and Real-system Control

**Impact: CRITICAL**

e2e 테스트는 실제 backend와 auth 경로를 사용하되 seed, cleanup, shared resource 위험을 의도적으로 통제해야 합니다.

### 5.1 Avoid Destructive Shared-account Scenarios and Parallel Collisions

**Impact: CRITICAL (keeps real-system browser tests from corrupting shared accounts or racing on the same remote resources)**

공유 관리자 계정으로 실패 로그인, 잠금, 비밀번호 변경 같은 destructive 시나리오를 검증하지 않습니다. 같은 원격 자원이나 계정을 동시에 건드릴 수 있으면 serial 실행이나 고립된 데이터 전략을 우선하고, 안정성이 중요한 로컬 e2e 스위트는 직렬 실행을 기본으로 봅니다.

**Incorrect (공유 계정과 병렬 충돌을 무시):**

```txt
- 공용 관리자 계정으로 틀린 비밀번호 시나리오 반복
- 같은 멤버 레코드를 여러 worker가 동시에 수정
```

**Correct (공유 자원 충돌을 피하는 전략 사용):**

```txt
- destructive 시나리오는 고립된 테스트 계정 사용
- 같은 원격 자원 충돌 가능 시 serial 실행
- 공용 계정은 smoke나 읽기 위주 검증에 한정
```

### 5.2 Seed With API Helpers and Clean Up in finally

**Impact: HIGH (keeps e2e setup fast and explicit without turning browser steps into slow seed scripts)**

e2e의 사전 상태가 필요하면 API helper로 준비하고 `finally`에서 cleanup합니다. seed는 브라우저 UI로 장황하게 만들지 않되, 검증 대상 자체를 API로 우회하지는 않습니다.

**Incorrect (준비 단계까지 브라우저로 장황하게 생성하거나 cleanup을 빼먹음):**

```txt
- 테스트 데이터 준비를 매번 브라우저 클릭으로 생성
- 검증 대상 업데이트도 API로 처리
- cleanup 없음
```

**Correct (준비는 API helper, 검증 대상은 브라우저, 정리는 finally):**

```ts
let memberId: string | undefined;

try {
	memberId = await support.members.createMemberViaApi();
	// 실제 수정 화면에서 브라우저로 검증
} finally {
	if (memberId) {
		await support.members.deleteMemberViaApi(memberId);
	}
}
```

### 5.3 Use Real Backend, Auth, and Routing in E2E

**Impact: CRITICAL (preserves the meaning of e2e by keeping the core backend, auth, and routing path real)**

E2E는 실제 로그인 또는 검증된 인증 helper, 실제 백엔드, 실제 라우팅과 번들 결과를 사용합니다. 인증 자체가 검증 대상이 아니더라도 핵심 엔드포인트를 mock하지 않고, 실제 사용자가 끝까지 완료할 수 있는 흐름을 검증합니다.

**Incorrect (핵심 엔드포인트를 mock하고 E2E라고 부름):**

```ts
test("실제 로그인 smoke", async ({page}) => {
	await page.route("**/api/login", async (route) => {
		await route.fulfill({body: JSON.stringify({token: "fake"})});
	});
});
```

**Correct (실제 인증과 백엔드 흐름을 사용):**

```ts
test("실제 로그인 성공 smoke", async ({page}) => {
	await support.auth.loginWithRealAccount(page);
	await expect(page).toHaveURL(/dashboard/);
});
```

## 6. Locators, Assertions, and Waiting

**Impact: HIGH**

브라우저 테스트는 접근 가능한 locator, web-first assertion, 실제 비동기 경계에만 쓰는 explicit waiting을 우선해야 합니다.

### 6.1 Allow Explicit Waits Only for Real Async Boundaries

**Impact: HIGH (keeps explicit waits intentional by limiting them to navigation, known responses, bootstrap, or real background polling)**

명시적 wait는 navigation 완료, 특정 API 응답, suspense bootstrap, 비동기 background job polling 같은 실제 비동기 경계에만 허용합니다. `expect.poll()`은 UI assertion으로 표현할 수 없는 서버 상태 polling에만 제한적으로 쓰고, `waitForTimeout()`이나 “느리니까 1초 더 기다리기” 식 sleep은 금지합니다.

**Incorrect (시간 기반 sleep 사용):**

```ts
await page.waitForTimeout(1000);
```

**Correct (실제 비동기 경계만 명시적으로 기다림):**

```ts
await page.waitForResponse(/api\/members/);
await expect(page).toHaveURL(/members/);
await expect.poll(async () => await support.jobs.readStatus(jobId)).toBe("done");
```

### 6.2 Prefer Accessible Playwright Locators

**Impact: HIGH (keeps selectors resilient and user-oriented by favoring accessible names over DOM structure)**

locator 우선순위는 `getByRole`, `getByLabel`/`getByPlaceholder`, `getByText`, `getByTestId`, 최후수단 CSS/XPath 순서입니다. 접근 가능한 이름과 실제 사용자 표현을 우선 사용하고, CSS class, DOM 구조, `nth-child` 의존 locator는 피합니다.

**Incorrect (DOM 구조와 class에 과도하게 의존):**

```ts
await page.locator(".members-form > div:nth-child(3) button.save").click();
```

**Correct (접근 가능한 locator를 우선 사용):**

```ts
await page.getByRole("button", {name: "저장"}).click();
await page.getByLabel("이메일").fill("user@example.com");
```

### 6.3 Use Web-first Assertions for UI Results

**Impact: HIGH (aligns assertions with the browser's async rendering model instead of relying on immediate checks of transient UI state)**

UI 결과는 `toBeVisible`, `toHaveText`, `toHaveValue`, `toHaveURL` 같은 web-first assertion을 기본으로 씁니다. 즉시 평가되는 generic assertion은 non-UI 값에만 쓰고, 내부 state나 cache, hook return 값 같은 구현 디테일 assertion은 하지 않습니다.

**Incorrect (즉시 평가와 구현 디테일에 의존):**

```ts
expect(await page.locator(".toast").textContent()).toBe("저장 완료");
expect(queryClient.getQueryData(["members"])).toBeDefined();
```

**Correct (브라우저 UI 결과를 web-first assertion으로 검증):**

```ts
await expect(page.getByText("저장 완료")).toBeVisible();
await expect(page).toHaveURL(/members/);
```

## 7. Guardrails and Review Checks

**Impact: MEDIUM**

마무리 전에는 테스트 레벨 의미를 흐리거나 flaky 브라우저 테스트를 만드는 shortcut을 기준으로 다시 점검해야 합니다.

### 7.1 Review Banned Playwright Shortcuts Before Finishing

**Impact: MEDIUM (catches the shortcuts that most often blur test level meaning or introduce flaky browser behavior before the work is closed)**

마무리 전에 반복적으로 금지되는 Playwright 지름길을 다시 확인합니다. 한 파일 안의 Integration/E2E 혼합, E2E에서 핵심 API route mocking, CSS class와 DOM 구조에 과도하게 의존한 locator, `waitForTimeout()`, 전역 숨은 mock, 공유 계정 destructive 사용 같은 패턴은 정리하고 끝냅니다.

**Incorrect (금지 패턴을 그대로 남김):**

```ts
test("real login", async ({page}) => {
	await page.route("**/api/login", async (route) => {
		await route.fulfill({body: JSON.stringify({token: "fake"})});
	});

	await page.waitForTimeout(1000);
	await page.locator(".btn:nth-child(2)").click();
});
```

**Correct (레벨 의미와 안정성을 유지):**

```ts
test("실제 로그인 성공 smoke", async ({page}) => {
	await support.auth.loginWithRealAccount(page);
	await expect(page).toHaveURL(/dashboard/);
	await page.getByRole("button", {name: "설정"}).click();
});
```

## 참고 자료

- https://playwright.dev/docs/intro
- https://playwright.dev/docs/test-assertions
- https://playwright.dev/docs/locators
