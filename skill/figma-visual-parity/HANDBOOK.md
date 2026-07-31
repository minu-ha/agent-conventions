# Figma Visual Parity

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 6월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.extends`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=figma-visual-parity`로 다시 생성하세요.

---

## 개요

Figma 링크, node URL, design screenshot을 기준 소스로 받아 실제 브라우저 구현 화면과의 visual parity를 맞추는 작업 규칙입니다. 이 가이드는 Figma MCP evidence 확보, Code Connect와 Figma REST API 활용, node JSON/reference image/variables/components/styles metadata 수집, 현재 구현 화면 확인, 구현 전 visual diff 표 작성, 정적 UI copy와 동적 API 데이터 구분, 기존 컴포넌트와 디자인 토큰 우선 사용, 브라우저 screenshot 기반 반복 검증, 남은 mismatch를 숨기지 않는 완료 보고를 강제합니다. 기능 구현 완료나 build/test 성공만으로 visual parity 작업을 완료 처리하지 않으며, Figma 기준 UI 구현에는 `react`, `css`, `playwright-test` companion skill을 함께 사용합니다.

이 문서에는 Figma Visual Parity 규칙만 담겨 있습니다. 아래 규칙도 함께 따릅니다.

---

## 함께 따르는 규칙

- [TypeScript Convention](../typescript/HANDBOOK.md) — 공통 규칙
- [CSS Convention](../css/HANDBOOK.md) — 공통 규칙
- [React Convention](../react/HANDBOOK.md) — 공통 규칙
- [Playwright Test Convention](../playwright-test/HANDBOOK.md) — 공통 규칙

---

## 목차

1. [Trigger and Scope](#1-trigger-and-scope) — **CRITICAL**
    - 1.1 [Skip This Skill When Design Parity Is Not the Goal](#11-skip-this-skill-when-design-parity-is-not-the-goal)
    - 1.2 [Use This Skill for Figma-sourced UI Work](#12-use-this-skill-for-figma-sourced-ui-work)
2. [Evidence and Visual Diff](#2-evidence-and-visual-diff) — **CRITICAL**
    - 2.1 [Capture Figma Evidence and Current Browser State Before Editing](#21-capture-figma-evidence-and-current-browser-state-before-editing)
    - 2.2 [Write the Visual Diff Table Before Implementation](#22-write-the-visual-diff-table-before-implementation)
3. [Integration Layers and API Evidence](#3-integration-layers-and-api-evidence) — **CRITICAL**
    - 3.1 [Audit and Use Every Available Figma Integration Layer](#31-audit-and-use-every-available-figma-integration-layer)
    - 3.2 [Map Variables, Components, and Styles to Project Tokens](#32-map-variables-components-and-styles-to-project-tokens)
    - 3.3 [Prefer Code Connect and Repo Components Over Rebuilding UI](#33-prefer-code-connect-and-repo-components-over-rebuilding-ui)
    - 3.4 [Use REST API for Node JSON and Reference Images When Available](#34-use-rest-api-for-node-json-and-reference-images-when-available)
4. [Static Copy and Dynamic Data](#4-static-copy-and-dynamic-data) — **CRITICAL**
    - 4.1 [Classify Static UI Copy and Dynamic Values](#41-classify-static-ui-copy-and-dynamic-values)
    - 4.2 [Do Not Confuse Static Labels with Server Data](#42-do-not-confuse-static-labels-with-server-data)
5. [Implementation Discipline](#5-implementation-discipline) — **HIGH**
    - 5.1 [Keep Parity Changes Scoped](#51-keep-parity-changes-scoped)
    - 5.2 [Preserve Visible Labels and Headings Unless Explicitly Removed](#52-preserve-visible-labels-and-headings-unless-explicitly-removed)
    - 5.3 [Reuse Existing Components and Design Tokens First](#53-reuse-existing-components-and-design-tokens-first)
6. [Verification and Reporting](#6-verification-and-reporting) — **CRITICAL**
    - 6.1 [Compare Screenshots Before Completion](#61-compare-screenshots-before-completion)
    - 6.2 [Report Scope, Data Boundaries, Mismatches, and Commands](#62-report-scope-data-boundaries-mismatches-and-commands)

---

## 1. Trigger and Scope

**Impact: CRITICAL**

Figma 링크, node, screenshot이 UI 구현 기준으로 제공된 경우에는 visual parity 작업으로 분류하고, 반대로 디자인 기준이 아닌 요청은 이 skill로 과잉 적용하지 않아야 합니다.

### 1.1 Skip This Skill When Design Parity Is Not the Goal

**Impact: HIGH (Figma와 무관한 기능/API 작업에 visual parity 절차를 과잉 적용하는 일을 막습니다)**

Figma 댓글 CSV 추출, API/데이터 로직 수정, 디자인 기준 없는 기능 구현, 사용자가 명시한 "대략만", "구조만",
"디자인 말고 동작만" 요청은 이 skill을 적용하지 않습니다.
Figma link가 있어도 사용 목적이 comment extraction이나 metadata export라면 visual parity workflow로 바꾸지 않습니다.

**Incorrect (디자인 기준이 아닌 작업에 parity 절차를 강제):**

```md
사용자: Figma 댓글을 CSV로 뽑아줘.
에이전트: visual diff 표와 브라우저 screenshot 검증을 요구함.
```

**Correct (사용 목적을 기준으로 제외):**

```md
사용자: Figma 댓글을 CSV로 뽑아줘.
에이전트: 댓글 추출 작업으로 처리하고 visual parity skill은 사용하지 않음.
```

### 1.2 Use This Skill for Figma-sourced UI Work

**Impact: CRITICAL (Figma가 기준 소스인 UI 작업에서 visual parity workflow가 빠지는 일을 막습니다)**

사용자가 Figma 링크, Figma node, Figma screenshot, design screenshot을 제공하고 구현, 싱크, 스타일 보정, 비교,
polish를 요청하면 이 작업은 visual parity 작업입니다.
새 UI든 기존 UI 수정이든 Figma가 기준 소스라면 먼저 Figma evidence와 현재 구현 화면을 확보해야 합니다.

**Incorrect (Figma 기준 요청을 일반 기능 구현처럼 처리):**

```md
사용자: 이 Figma 기준으로 구현해줘.
에이전트: 컴포넌트부터 만들고 build 통과 후 완료 보고.
```

**Correct (Figma 기준 소스임을 먼저 분류):**

```md
사용자: 이 Figma 기준으로 구현해줘.
에이전트: Figma node/screenshot, 현재 브라우저 화면, visual diff 표를 먼저 확보한 뒤 구현 범위를 정함.
```

## 2. Evidence and Visual Diff

**Impact: CRITICAL**

구현 전에 Figma evidence와 현재 브라우저 구현 화면을 모두 확보하고, visual diff 표로 차이를 분류해야 작업 범위와 검증 기준이 분명해집니다.

### 2.1 Capture Figma Evidence and Current Browser State Before Editing

**Impact: CRITICAL (기준 화면과 현재 화면 없이 CSS를 추측 수정하는 일을 막습니다)**

구현 전에 Figma node/design context/screenshot과 현재 브라우저 구현 화면을 모두 확인합니다.
Figma node가 너무 크거나 tool fetch가 실패하면 더 작은 node, parent section, screenshot, metadata fallback을 사용하고,
확보한 evidence와 한계를 기록합니다.

**Incorrect (Figma node 실패를 이유로 분석 포기):**

```md
Figma context fetch 실패. 기존 화면만 보고 spacing을 대략 조정한다.
```

**Correct (fallback evidence를 확보하고 한계를 기록):**

```md
Figma node fetch 실패.
1. 더 작은 child node 요청 또는 탐색
2. parent section screenshot 확인
3. metadata fallback으로 레이어명/크기 확인
4. 모르는 항목은 visual diff 표에 "확인 필요"로 기록
```

### 2.2 Write the Visual Diff Table Before Implementation

**Impact: CRITICAL (구현 범위와 완료 기준을 layout, spacing, typography 같은 항목으로 명확히 고정합니다)**

코드를 수정하기 전에 Figma와 현재 구현의 차이를 표로 작성합니다.
최소 항목은 layout, spacing, typography, color, border/radius, surface/background, shadow, icon/assets, static copy,
states, responsive behavior입니다.

**Incorrect (차이 분류 없이 바로 수정):**

```md
Figma가 더 촘촘해 보여서 padding과 font-size를 조금 줄임.
```

**Correct (수정 기준을 먼저 표로 고정):**

```md
| 항목 | Figma | 현재 구현 | 수정 방침 |
| --- | --- | --- | --- |
| spacing | 카드 내부 12px | 카드 내부 20px | token spacing-sm로 축소 |
| static copy | "상세 보기" | "보기" | Figma copy로 맞춤 |
| metric value | 예시 숫자 98.7% | API 응답 값 | 하드코딩하지 않음 |
```

## 3. Integration Layers and API Evidence

**Impact: CRITICAL**

Figma MCP, Code Connect, REST API, variables/components/styles metadata, browser screenshot diff 중 사용 가능한 계층은 모두 조합하고, 없는 계층은 명시적으로 fallback해야 구현 품질을 최대로 끌어올릴 수 있습니다.

### 3.1 Audit and Use Every Available Figma Integration Layer

**Impact: CRITICAL (MCP만 쓰고 끝내지 않고 사용 가능한 integration을 모두 조합하게 합니다)**

Figma visual parity 작업을 시작하면 먼저 사용 가능한 integration을 audit합니다.
Figma MCP, Code Connect, Figma REST API token, variables/components/styles metadata, repo design system inventory,
browser screenshot diff 중 접근 가능한 것은 모두 사용합니다.
접근할 수 없는 계층은 조용히 생략하지 말고 "없음", "권한 없음", "scope 부족", "rate limit",
"tool unavailable"처럼 이유를 기록합니다.

**Incorrect (MCP 한 계층만 보고 바로 구현):**

```md
Figma MCP screenshot을 봤으니 바로 CSS를 수정한다.
Code Connect, REST API token, variables metadata, browser diff 가능 여부는 확인하지 않는다.
```

**Correct (가능한 evidence layer를 먼저 정리):**

```md
Integration audit:
- Figma MCP: 사용 가능, design context와 screenshot 확보
- Code Connect: 사용 가능, Button/Table snippet 확인
- Figma REST API: FIGMA_TOKEN 있음, node JSON과 reference PNG 확보
- Variables API: 403 file_variables:read scope 없음, repo token inventory로 fallback
- Browser diff: Playwright screenshot 확인 가능
```

### 3.2 Map Variables, Components, and Styles to Project Tokens

**Impact: HIGH (Figma token metadata를 확인할 수 있는데도 raw visual value를 하드코딩하는 일을 줄입니다)**

권한이 있으면 Figma variables, components, styles metadata를 확인해 project token과 component mapping에 반영합니다.
`file_variables:read` scope가 있으면 `GET /v1/files/:file_key/variables/local` 또는 published variables endpoint로
mode별 token 값을 확인합니다.
published component/style metadata가 필요하면 file/team component endpoints를 사용합니다.
scope, plan, rate limit 때문에 실패하면 repo의 CSS variable, design token, component usage inventory로 fallback합니다.

**Incorrect (metadata 확인 없이 raw value를 늘림):**

```css
.card {
  color: #1a5cff;
  border-radius: 13px;
}
```

**Correct (Figma variable/style과 project token을 매핑):**

```md
Token mapping:
- Figma variable `color/action/primary` -> `--color-action-primary`
- Figma radius style `radius/card/default` -> `--radius-card`
- Figma Table component -> `DataTable` usage in src/components
```

### 3.3 Prefer Code Connect and Repo Components Over Rebuilding UI

**Impact: CRITICAL (실제 디자인 시스템 컴포넌트를 무시하고 raw JSX/CSS를 새로 만드는 일을 막습니다)**

Code Connect context가 있으면 import statement, component snippet, prop mapping, variant value,
custom instruction을 우선 구현 기준으로 사용합니다.
Code Connect가 없으면 repo의 `src/components`, `src/shared`, design system docs,
existing route usage를 검색해 Figma component와 code component mapping table을 먼저 작성합니다.
새 컴포넌트나 raw CSS는 기존 컴포넌트로 표현할 수 없을 때만 만듭니다.

**Incorrect (연결된 component snippet을 무시):**

```tsx
// Figma Button에 Code Connect snippet이 있는데도 새 버튼 markup을 만듦
<button className="primary-blue-rounded-button">저장</button>
```

**Correct (Code Connect 또는 repo component mapping을 구현 기준으로 사용):**

```tsx
import {Button} from "@/components/ui/button";

<Button variant="primary" size="sm">
  저장
</Button>
```

### 3.4 Use REST API for Node JSON and Reference Images When Available

**Impact: CRITICAL (Figma URL에서 구조화된 node 데이터와 비교용 reference image를 확보하게 합니다)**

Figma REST API token이 있으면 Figma URL에서 `fileKey`와 `nodeId`를 파싱합니다.
URL의 `node-id=1-2`는 API 요청용 `1:2`로 변환합니다.
`GET /v1/files/:key/nodes?ids=<nodeId>`로 node JSON과 subtree를 확인하고, 큰 node는 `depth`를 낮춰 구조를 먼저 봅니다.
`GET /v1/images/:key?ids=<nodeId>&format=png&scale=2`로 reference image를 확보해 browser screenshot diff 기준으로
사용합니다.
token, signed image URL, 원본 응답 전체는 로그나 커밋에 노출하지 않습니다.

**Incorrect (REST API 사용 가능 상태를 무시):**

```md
FIGMA_TOKEN과 node URL이 있지만 MCP screenshot만 보고 구현한다.
reference image 없이 눈대중으로 browser 화면을 비교한다.
```

**Correct (구조와 reference image를 함께 확보):**

```md
Parsed Figma URL:
- fileKey: abc123
- nodeId: 12:34

REST evidence:
- GET /v1/files/:key/nodes?ids=12:34
- GET /v1/images/:key?ids=12:34&format=png&scale=2
```

## 4. Static Copy and Dynamic Data

**Impact: CRITICAL**

Figma에 보이는 값이 static UI copy인지 dynamic API data인지 먼저 분류해야 UI copy는 맞추고 서버 데이터는 하드코딩하지 않는 균형을 지킬 수 있습니다.

### 4.1 Classify Static UI Copy and Dynamic Values

**Impact: CRITICAL (Figma copy는 맞추되 서버/API 값을 하드코딩하는 오류를 막습니다)**

Figma에 보이는 모든 텍스트와 숫자를 static UI copy와 dynamic data로 먼저 분류합니다.
버튼명, 탭명, 컬럼명, 라벨, placeholder, empty state, default option, 고정 안내문구는 Figma 기준으로 맞춥니다.
row data, metric value, user-specific data, API mock 값은 UI 고정값처럼 하드코딩하지 않습니다.

**Incorrect (Figma 숫자를 API 값 대신 하드코딩):**

```tsx
<MetricCard label="성공률" value="98.7%" />
```

**Correct (static label만 맞추고 value는 데이터 오리진 유지):**

```tsx
<MetricCard label="성공률" value={responseMetric.successRateLabel} />
```

### 4.2 Do Not Confuse Static Labels with Server Data

**Impact: HIGH (Figma의 고정 라벨과 섹션 제목을 데이터라는 이유로 방치하는 일을 막습니다)**

Figma static label을 서버 데이터라고 착각해서 맞추지 않는 것도 오류입니다.
버튼 텍스트, column header, tab label, empty state,
section heading은 제품 copy이므로 Figma 또는 사용자 지시를 기준으로 맞춥니다.
애매하면 먼저 "static copy 후보"와 "dynamic data 후보"로 분류해 보고합니다.

**Incorrect (고정 라벨을 데이터라고 보고 방치):**

```md
Figma: "활성 포지션"
현재 구현: "운영중"
판단: 서버에서 내려오는 것 같으니 변경하지 않음.
```

**Correct (visible static label은 Figma 기준으로 맞춤):**

```md
Figma: "활성 포지션"
현재 구현: "운영중"
판단: 탭 라벨은 static UI copy이므로 Figma 기준으로 "활성 포지션"에 맞춤.
```

## 5. Implementation Discipline

**Impact: HIGH**

Visual parity 구현은 기존 컴포넌트와 디자인 토큰을 우선 사용하고, scope 밖 구조 변경이나 label 삭제를 피해야 실제 제품 코드의 일관성을 유지합니다.

### 5.1 Keep Parity Changes Scoped

**Impact: HIGH (visual polish 중 불필요한 구조 리팩터링과 shared surface 변경을 막습니다)**

Visual parity 작업은 Figma와 현재 화면의 차이를 줄이는 데 집중합니다.
불필요한 구조 리팩터링, API/data shaping 변경, shared component/style 변경을 기본값으로 삼지 않습니다.
scope 밖 shared surface 변경이 필요하면 왜 필요한지 먼저 보고하고 승인을 받습니다.

**Incorrect (스타일 보정 중 구조를 크게 바꿈):**

```md
scope: src/pages/detail
작업: 공용 Button variant, 전역 table CSS, API response mapper까지 함께 리팩터링.
```

**Correct (scope 안에서 parity 차이를 먼저 줄임):**

```md
scope: src/pages/detail
작업: detail-local wrapper와 CSS token 조정으로 Figma spacing/color/radius를 맞춤.
공용 Button 변경 필요성은 별도 보고.
```

### 5.2 Preserve Visible Labels and Headings Unless Explicitly Removed

**Impact: HIGH (UI polish 중 사용자에게 보이는 구조 신호를 임의로 삭제하는 일을 막습니다)**

Visible label, section title, heading, column header는 화면 구조와 접근성의 일부입니다.
Figma 또는 사용자가 명확히 제거하라고 하지 않는 한, visual polish를 이유로 임의 삭제하지 않습니다.
Figma에 label이 있고 현재 구현에 없으면 static UI copy로 맞출 후보입니다.

**Incorrect (깔끔해 보이게 하려고 heading 삭제):**

```tsx
return <DataTable rows={rows} />;
```

**Correct (Figma의 visible section title 유지):**

```tsx
return (
  <section aria-labelledby="position-summary-title">
    <h2 id="position-summary-title">포지션 요약</h2>
    <DataTable rows={rows} />
  </section>
);
```

### 5.3 Reuse Existing Components and Design Tokens First

**Impact: HIGH (visual parity 작업이 raw CSS 누적이나 디자인 시스템 우회로 흐르는 일을 막습니다)**

Figma와 맞지 않는 부분을 고칠 때도 기존 컴포넌트, CSS 변수, spacing/color/type token,
local wrapper 규칙을 먼저 확인합니다.
필요한 경우 owner scope 안에서 CSS/layout을 조정하되, 디자인 시스템에 이미 있는 표현을 raw value로 새로 늘리지 않습니다.

**Incorrect (토큰 확인 없이 raw CSS만 추가):**

```css
.summary-card {
  padding: 13px 19px;
  color: #2663eb;
  border-radius: 11px;
}
```

**Correct (기존 token과 owner scope를 우선 사용):**

```css
.detail-summary-card {
  padding: var(--spacing-3);
  color: var(--color-accent-primary);
  border-radius: var(--radius-md);
}
```

## 6. Verification and Reporting

**Impact: CRITICAL**

완료 기준은 build/test 성공이 아니라 Figma screenshot과 browser screenshot 비교이며, 남은 mismatch와 검증 명령을 완료 보고에 남겨야 합니다.

### 6.1 Compare Screenshots Before Completion

**Impact: CRITICAL (build/test 성공만으로 visual parity 완료를 선언하는 일을 막습니다)**

Build/test 통과는 필요하지만 visual parity의 완료 조건은 아닙니다.
실제 브라우저에서 구현 화면 screenshot을 확인하고,
Figma screenshot과 비교해 mismatch가 남으면 가능한 범위에서 수정을 반복합니다.
브라우저 검증을 못 하면 완료가 아니라 미검증 상태로 보고합니다.

**Incorrect (빌드 성공만으로 완료):**

```md
npm run build 통과했습니다. 완료입니다.
```

**Correct (브라우저 screenshot 비교까지 보고):**

```md
npm run build 통과.
브라우저 screenshot 확인 완료.
Figma 대비 spacing과 button label mismatch 수정 완료.
남은 mismatch: chart 내부 tick label은 third-party canvas 렌더링이라 별도 후속 필요.
```

### 6.2 Report Scope, Data Boundaries, Mismatches, and Commands

**Impact: CRITICAL (완료 보고에서 근거, 제외 항목, 남은 차이를 숨기는 일을 막습니다)**

완료 보고에는 사용한 Figma 링크/node, 수정 scope, 구현한 visual parity 항목, 동적 데이터라서 하드코딩하지 않은 항목,
정적 UI copy로 맞춘 항목, 브라우저 screenshot 검증 여부, 남은 mismatch, 실행한 검증 명령을 포함합니다.

**Incorrect (검증 근거와 남은 차이를 생략):**

```md
Figma에 맞춰 스타일 수정했습니다. 테스트도 통과했습니다.
```

**Correct (완료 기준을 추적 가능하게 보고):**

```md
- 사용한 Figma 링크/node: node-id=12:34
- 수정 scope: src/pages/detail/**
- 구현한 visual parity 항목: layout, spacing, typography, static copy
- 동적 데이터라서 하드코딩하지 않은 항목: metric value, row count
- 정적 UI copy로 맞춘 항목: tab label, empty state
- 브라우저 screenshot 검증 여부: 완료
- 남은 mismatch: chart axis는 canvas renderer 제한으로 남음
- 실행한 검증 명령: npm run build, npm run test
```

## 참고 자료

- https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/
- https://developers.figma.com/docs/figma-mcp-server/code-connect-integration/
- https://developers.figma.com/docs/rest-api/file-endpoints/
- https://developers.figma.com/docs/rest-api/variables-endpoints/
- https://developers.figma.com/docs/rest-api/component-endpoints/
- https://developers.figma.com/docs/rest-api/scopes/
- https://developers.figma.com/docs/rest-api/rate-limits/
