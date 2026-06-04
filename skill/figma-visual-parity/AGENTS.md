# Figma Visual Parity

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 6월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.extends`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=figma-visual-parity`로 다시 생성하세요.

---

## 개요

Figma 링크, node URL, design screenshot을 기준 소스로 받아 실제 브라우저 구현 화면과의 visual parity를 맞추는 작업 규칙입니다. 이 가이드는 Figma evidence 확보, 현재 구현 화면 확인, 구현 전 visual diff 표 작성, 정적 UI copy와 동적 API 데이터 구분, 기존 컴포넌트와 디자인 토큰 우선 사용, 브라우저 screenshot 기반 반복 검증, 남은 mismatch를 숨기지 않는 완료 보고를 강제합니다. 기능 구현 완료나 build/test 성공만으로 visual parity 작업을 완료 처리하지 않으며, Figma 기준 UI 구현에는 `react`, `css`, `playwright-test` companion skill을 함께 사용합니다.

이 가이드는 local Figma Visual Parity 규칙만 담고 있습니다. 공통 규칙은 companion skill을 함께 로드해 보완합니다.

---

## 함께 로드할 Companion Skill

- `convention-typescript` - TypeScript Convention 공통 규칙 guide: [TypeScript Convention](../typescript/AGENTS.md)
- `convention-react` - React Convention 공통 규칙 guide: [React Convention](../react/AGENTS.md)
- `convention-css` - CSS Convention 공통 규칙 guide: [CSS Convention](../css/AGENTS.md)
- `convention-playwright-test` - Playwright Test Convention 공통 규칙 guide: [Playwright Test Convention](../playwright-test/AGENTS.md)

---

## 목차

1. [Trigger and Scope](#1-trigger-and-scope) — **CRITICAL**
    - 1.1 [Skip This Skill When Design Parity Is Not the Goal](#11-skip-this-skill-when-design-parity-is-not-the-goal)
    - 1.2 [Use This Skill for Figma-sourced UI Work](#12-use-this-skill-for-figma-sourced-ui-work)
2. [Evidence and Visual Diff](#2-evidence-and-visual-diff) — **CRITICAL**
    - 2.1 [Capture Figma Evidence and Current Browser State Before Editing](#21-capture-figma-evidence-and-current-browser-state-before-editing)
    - 2.2 [Write the Visual Diff Table Before Implementation](#22-write-the-visual-diff-table-before-implementation)
3. [Static Copy and Dynamic Data](#3-static-copy-and-dynamic-data) — **CRITICAL**
    - 3.1 [Classify Static UI Copy and Dynamic Values](#31-classify-static-ui-copy-and-dynamic-values)
    - 3.2 [Do Not Confuse Static Labels with Server Data](#32-do-not-confuse-static-labels-with-server-data)
4. [Implementation Discipline](#4-implementation-discipline) — **HIGH**
    - 4.1 [Keep Parity Changes Scoped](#41-keep-parity-changes-scoped)
    - 4.2 [Preserve Visible Labels and Headings Unless Explicitly Removed](#42-preserve-visible-labels-and-headings-unless-explicitly-removed)
    - 4.3 [Reuse Existing Components and Design Tokens First](#43-reuse-existing-components-and-design-tokens-first)
5. [Verification and Reporting](#5-verification-and-reporting) — **CRITICAL**
    - 5.1 [Compare Screenshots Before Completion](#51-compare-screenshots-before-completion)
    - 5.2 [Report Scope, Data Boundaries, Mismatches, and Commands](#52-report-scope-data-boundaries-mismatches-and-commands)

---

## 1. Trigger and Scope

**Impact: CRITICAL**

Figma 링크, node, screenshot이 UI 구현 기준으로 제공된 경우에는 visual parity 작업으로 분류하고, 반대로 디자인 기준이 아닌 요청은 이 skill로 과잉 적용하지 않아야 합니다.

### 1.1 Skip This Skill When Design Parity Is Not the Goal

**Impact: HIGH (Figma와 무관한 기능/API 작업에 visual parity 절차를 과잉 적용하지 않게 함)**

Figma 댓글 CSV 추출, API/데이터 로직 수정, 디자인 기준 없는 기능 구현, 사용자가 명시한 "대략만", "구조만", "디자인 말고 동작만" 요청은 이 skill을 적용하지 않습니다. Figma link가 있어도 사용 목적이 comment extraction이나 metadata export라면 visual parity workflow로 바꾸지 않습니다.

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

**Impact: CRITICAL (Figma가 기준 소스인 UI 작업에서 visual parity workflow가 빠지지 않게 함)**

사용자가 Figma 링크, Figma node, Figma screenshot, design screenshot을 제공하고 구현, 싱크, 스타일 보정, 비교, polish를 요청하면 이 작업은 visual parity 작업입니다. 새 UI든 기존 UI 수정이든 Figma가 기준 소스라면 먼저 Figma evidence와 현재 구현 화면을 확보해야 합니다.

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

**Impact: CRITICAL (기준 화면과 현재 화면 없이 CSS를 추측 수정하는 일을 막음)**

구현 전에 Figma node/design context/screenshot과 현재 브라우저 구현 화면을 모두 확인합니다. Figma node가 너무 크거나 tool fetch가 실패하면 더 작은 node, parent section, screenshot, metadata fallback을 사용하고, 확보한 evidence와 한계를 기록합니다.

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

**Impact: CRITICAL (구현 범위와 완료 기준을 layout, spacing, typography 같은 항목으로 명확히 고정함)**

코드를 수정하기 전에 Figma와 현재 구현의 차이를 표로 작성합니다. 최소 항목은 layout, spacing, typography, color, border/radius, surface/background, shadow, icon/assets, static copy, states, responsive behavior입니다.

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

## 3. Static Copy and Dynamic Data

**Impact: CRITICAL**

Figma에 보이는 값이 static UI copy인지 dynamic API data인지 먼저 분류해야 UI copy는 맞추고 서버 데이터는 하드코딩하지 않는 균형을 지킬 수 있습니다.

### 3.1 Classify Static UI Copy and Dynamic Values

**Impact: CRITICAL (Figma copy는 맞추되 서버/API 값을 하드코딩하는 오류를 막음)**

Figma에 보이는 모든 텍스트와 숫자를 static UI copy와 dynamic data로 먼저 분류합니다. 버튼명, 탭명, 컬럼명, 라벨, placeholder, empty state, default option, 고정 안내문구는 Figma 기준으로 맞춥니다. row data, metric value, user-specific data, API mock 값은 UI 고정값처럼 박지 않습니다.

**Incorrect (Figma 숫자를 API 값 대신 하드코딩):**

```tsx
<MetricCard label="성공률" value="98.7%" />
```

**Correct (static label만 맞추고 value는 데이터 오리진 유지):**

```tsx
<MetricCard label="성공률" value={responseMetric.successRateLabel} />
```

### 3.2 Do Not Confuse Static Labels with Server Data

**Impact: HIGH (Figma의 고정 라벨과 섹션 제목을 데이터라는 이유로 방치하지 않게 함)**

Figma static label을 서버 데이터라고 착각해서 맞추지 않는 것도 오류입니다. 버튼 텍스트, column header, tab label, empty state, section heading은 제품 copy이므로 Figma 또는 사용자 지시를 기준으로 맞춥니다. 애매하면 먼저 "static copy 후보"와 "dynamic data 후보"로 분류해 보고합니다.

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

## 4. Implementation Discipline

**Impact: HIGH**

Visual parity 구현은 기존 컴포넌트와 디자인 토큰을 우선 사용하고, scope 밖 구조 변경이나 label 삭제를 피해야 실제 제품 코드의 일관성을 유지합니다.

### 4.1 Keep Parity Changes Scoped

**Impact: HIGH (visual polish 중 불필요한 구조 리팩터링과 shared surface 변경을 막음)**

Visual parity 작업은 Figma와 현재 화면의 차이를 줄이는 데 집중합니다. 불필요한 구조 리팩터링, API/data shaping 변경, shared component/style 변경을 기본값으로 삼지 않습니다. scope 밖 shared surface 변경이 필요하면 왜 필요한지 먼저 보고하고 승인을 받습니다.

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

### 4.2 Preserve Visible Labels and Headings Unless Explicitly Removed

**Impact: HIGH (UI polish 중 사용자에게 보이는 구조 신호를 임의 삭제하지 않게 함)**

Visible label, section title, heading, column header는 화면 구조와 접근성의 일부입니다. Figma 또는 사용자가 명확히 제거하라고 하지 않는 한, visual polish를 이유로 임의 삭제하지 않습니다. Figma에 label이 있고 현재 구현에 없으면 static UI copy로 맞출 후보입니다.

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

### 4.3 Reuse Existing Components and Design Tokens First

**Impact: HIGH (visual parity 작업이 raw CSS 누적이나 디자인 시스템 우회로 흐르지 않게 함)**

Figma와 맞지 않는 부분을 고칠 때도 기존 컴포넌트, CSS 변수, spacing/color/type token, local wrapper 규칙을 먼저 확인합니다. 필요한 경우 owner scope 안에서 CSS/layout을 조정하되, 디자인 시스템에 이미 있는 표현을 raw value로 새로 늘리지 않습니다.

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

## 5. Verification and Reporting

**Impact: CRITICAL**

완료 기준은 build/test 성공이 아니라 Figma screenshot과 browser screenshot 비교이며, 남은 mismatch와 검증 명령을 완료 보고에 남겨야 합니다.

### 5.1 Compare Screenshots Before Completion

**Impact: CRITICAL (build/test 성공만으로 visual parity 완료를 선언하는 일을 막음)**

Build/test 통과는 필요하지만 visual parity의 완료 조건은 아닙니다. 실제 브라우저에서 구현 화면 screenshot을 확인하고, Figma screenshot과 비교해 mismatch가 남으면 가능한 범위에서 수정 반복합니다. 브라우저 검증을 못 하면 완료가 아니라 미검증 상태로 보고합니다.

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

### 5.2 Report Scope, Data Boundaries, Mismatches, and Commands

**Impact: CRITICAL (완료 보고에서 근거, 제외 항목, 남은 차이를 숨기지 않게 함)**

완료 보고에는 사용한 Figma 링크/node, 수정 scope, 구현한 visual parity 항목, 동적 데이터라서 하드코딩하지 않은 항목, 정적 UI copy로 맞춘 항목, 브라우저 screenshot 검증 여부, 남은 mismatch, 실행한 검증 명령을 포함합니다.

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

- https://www.figma.com/developers/api
- https://help.figma.com/hc/en-us/articles/360040028034-View-and-adjust-colors-in-a-design-file
