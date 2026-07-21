# Progressive Convention Loading Design

**Goal:** React, TypeScript, CSS 작업에서 필요한 규칙을 빠짐없이 적용하면서도, 매번 세 skill의 전체 handbook을 context에 넣는 비용을 없앤다.

## 배경

현재 structured skill은 작은 `rules/*.md`를 source of truth로 관리하지만, 실제 activation guide는 먼저 generated `AGENTS.md` 전체를 읽고 관련 rule 원문도 다시 읽도록 안내한다. 고정한 `tiktoken==0.11.0`, `o200k_base` 실측에서 React + TypeScript + CSS entrypoint와 compiled guide 1회 로드는 38,102 token이고, 선택한 rule을 다시 읽는 비용까지 중복된다.

문제는 skill을 세 개로 나눈 구조가 아니라 loading contract다. 프로젝트 `AGENTS.md`에 모든 규칙을 합치면 activation은 단순해지지만, 모든 작업에 모든 규칙이 상시 주입되고 규칙 정본도 프로젝트별로 복제된다. 따라서 세 domain skill은 유지하되, 각 skill을 **작은 router + compact rule index + generated selected contract + deterministic full-rule expansion** 구조로 바꾼다.

## 설계 원칙

1. `rules/*.md`는 계속 유일한 규칙 정본이다.
2. `SKILL.md`는 규칙집이 아니라 scope를 분류하고 필요한 원문을 선택하는 router다.
3. agent는 규칙 제목만 추측하지 않고 generated index의 적용 조건을 전부 훑는다.
4. 선택된 규칙은 source에서 자동 생성한 normative contract를 읽고, CRITICAL 또는 exact 판단 근거가 더 필요한 rule은 full source까지 읽는다. 별도 수동 요약 정본은 만들지 않는다.
5. 선택하지 않은 규칙도 index 수준에서 applicability를 판정했다는 coverage evidence를 남긴다.
6. scope가 바뀌면 selection을 다시 수행한다.
7. 완료 전 semantic audit에서 누락, 위반, 증거 부족을 차단한다.
8. compiled `AGENTS.md`는 삭제하지 않되 기본 activation 경로에서 제외한다.

## 범위

이번 변경은 다음을 포함한다.

- `convention-react`, `convention-typescript`, `convention-css`의 progressive loading
- 세 skill rule의 명시적 적용 조건 metadata
- compact `RULES_INDEX.md` 생성과 검증
- source rule에서 생성하는 `contracts/*.md`, CRITICAL full-rule gate, missing/stale/orphan 검증
- 세 `SKILL.md`의 router화
- `convention-audit`의 index 기반 coverage 및 selected-rule semantic audit
- package build, validate, test, 문서, pressure test 갱신
- consuming project가 복사할 수 있는 짧은 `AGENTS.md` activation policy

## 범위 밖

- React, TypeScript, CSS를 하나의 거대한 skill 또는 단일 convention 파일로 병합
- 기존 규칙의 의미를 약화하거나 삭제
- 실제 제품 저장소의 `AGENTS.md`를 이번 작업에서 자동 변경
- 다른 structured skill 전체를 한 번에 progressive loading으로 마이그레이션
- `AGENTS.md` full handbook 생성 중단
- 모델별 input caching을 token 절감으로 간주

## 산출물 구조

세 progressive skill은 아래 구조를 가진다.

```text
skill/react/
  SKILL.md           # 작고 고정된 activation router
  RULES_INDEX.md     # generated compact applicability index
  contracts/         # generated selected-rule normative contract
    *.md
  AGENTS.md          # generated full local handbook, opt-in
  rules/
    _sections.md
    _template.md
    *.md             # source of truth
```

### `rules/*.md`

각 rule frontmatter에 한 줄짜리 `appliesWhen`을 추가한다.

```yaml
---
title: Prefer Named Handlers Over Inline Callbacks
impact: HIGH
impactDescription: keeps JSX readable and event flow auditable
appliesWhen: TSX event prop에 분기, 비동기 작업, 상태 변경 또는 두 단계 이상의 동작이 들어간다.
reviewWith: events-keep-handler-flow-inline, typescript/docs-standardize-annotation-tags-by-declaration-role
tags: composition, jsx, handlers
---
```

`appliesWhen`은 다음 계약을 따른다.

- agent가 diff 또는 요청에서 관찰할 수 있는 조건으로 작성한다.
- 규칙의 결론을 반복하지 않고 **언제 원문을 읽어야 하는지**를 설명한다.
- 한 줄, 한 문장, 최대 160자로 제한한다.
- 애매한 경우 해당 rule을 선택하도록 보수적으로 작성한다.
- `impact`, `tags`, rule body를 대체하지 않는다.

rule body의 heading/Impact 뒤 규범과 예외는 첫 anchored `Incorrect` marker 앞에 완결한다. 첫 `Incorrect` 뒤에는 `Incorrect`/`Correct` label, fenced code, 빈 줄만 허용한다. build/validate가 fence 밖 marker와 후반 prose를 검사해 generated contract가 규범을 조용히 누락하지 못하게 한다.

선택 누락이 반복되기 쉬운 multi-rule concern은 optional `reviewWith` scalar에 comma-separated stable rule id를 선언한다. 다른 skill rule은 `<skill>/<rule-id>`로 적는다. `reviewWith`는 대상 rule을 자동 PASS하거나 무조건 selected로 만들지 않고, 해당 target의 `appliesWhen`을 명시적으로 재판정하게 하는 closure hint다.

이 필드는 우선 React, TypeScript, CSS에서 필수다. 다른 structured skill은 migration 전까지 기존 schema로 계속 build할 수 있어야 한다.

### `RULES_INDEX.md`

build가 `_sections.md` 순서와 rule 정렬 순서를 이용해 생성한다. token 측정에서 title/impact/tag 중복이 index 비용을 키운 것이 확인됐으므로 각 rule entry에는 selection에 필요한 다음 정보만 둔다.

- stable rule id: 확장자를 뺀 filename
- `appliesWhen`
- optional `reviewWith`
- stable rule id와 같은 이름의 generated `contracts/<stable-id>.md` 결정 규칙

문서 header에는 전체 local rule 수와 canonical routing/source SHA-256 digest를 함께 생성한다. 각 entry에는 현재 index 안에서만 쓰는 compact ordinal도 붙인다. digest에는 routing metadata, full source body hash, contract renderer version이 들어가므로 규범·예시·renderer가 바뀌면 기존 receipt도 stale이다. router와 auditor는 이 값들을 coverage reconciliation의 기준으로 사용하며 숫자나 index version을 수동으로 관리하지 않는다.

예시:

```md
- `R12` · `composition-named-handlers-over-inline` · TSX event prop에 분기, 비동기 작업, 상태 변경 또는 두 단계 이상의 동작이 들어간다. · reviewWith: `events-keep-handler-flow-inline`
```

stable identity는 filename 기반 rule id이고 ordinal은 exact set을 짧게 기록하기 위한 index-local 표현이다. rule 순서나 source body가 달라지면 digest도 달라지므로 서로 다른 index version의 ordinal을 섞을 수 없다. index에는 title/impact/tag, rule 설명, Incorrect/Correct 예시, full body를 넣지 않는다.

### `contracts/*.md`

build가 source `rules/*.md`에서 자동 생성하고 직접 편집을 금지한다. non-CRITICAL contract는 heading, Impact, 첫 Incorrect 전 normative prose를 보존하고 예시는 full rule 링크로 미룬다. CRITICAL contract는 짧은 redirect만 생성해 full rule을 반드시 읽게 한다. non-CRITICAL도 exact syntax·예외 판단, unresolved Unknown, audit PASS evidence 부족이면 full rule로 확장하고 receipt에 `Expanded: ordinal + ID: reason`을 기록한다.

### `AGENTS.md`

현재와 같이 local full handbook을 생성한다. 다음 경우에만 명시적으로 읽는다.

progressive full handbook은 각 local rule heading 바로 아래에 source frontmatter의 escaped `Applies when`을 생성한다. 따라서 전체 원문을 opt-in한 agent도 규범 내용만 보고 범위를 과도하게 넓히지 않으며, index와 같은 적용 조건으로 exact partition을 만들 수 있어야 한다.

- 사람의 전체 convention 온보딩
- skill 자체 유지보수
- 전체 규칙 문구 비교 또는 comprehensive handbook review를 사용자가 요청한 경우
- generated index/contract 또는 필요한 개별 rule 원문이 손상·누락되어 정상 경로를 읽을 수 없는 fallback

일반적인 코드 수정과 완료 audit에서는 기본으로 읽지 않는다.

## Activation Router Contract

각 `SKILL.md`는 아래 순서를 짧고 명시적으로 강제한다.

### 1. Scope snapshot

편집 전에 요청, 대상 파일, diff를 기준으로 domain을 활성화한다.

| 변경 surface | 활성화할 skill |
|---|---|
| `.tsx`, React component/hook/state/event/JSX | React + TypeScript |
| `.ts`, type/schema/helper/API/config | TypeScript |
| `.css`, stylesheet ownership/selector/token | CSS |
| TSX `className`, CSS import, styled surface를 함께 변경 | React + TypeScript + CSS |

파일 확장자는 최소 신호다. 예를 들어 `.tsx`에서 class contract를 바꾸면 CSS도 활성화하고, `.ts`만 수정해도 React hook ownership을 바꾸면 React도 활성화한다.

### 2. Index scan and rule selection

활성화된 각 skill의 `RULES_INDEX.md`를 처음부터 끝까지 읽는다. 요청 및 변경 증거가 `appliesWhen`과 일치하면 해당 rule을 `Selected`, 명확히 아니면 근거 있는 `N/A`, 애매하면 `Unknown`으로 분류한다.

- CRITICAL/HIGH라고 해서 무조건 선택하지 않는다. 적용 가능성이 애매하면 `Unknown`에 두고 contract와 필요한 full rule 증거로 완료 전 해소한다.
- title/tag만으로 배제하지 않는다.
- 기존 tag vocabulary는 단수/복수와 유사어가 섞여 있으므로 자동 keyword matcher의 selection 근거로 사용하지 않는다. tag는 탐색 보조 정보이고 `appliesWhen` 전체 scan과 실제 scope evidence가 판정 기준이다.
- companion skill은 파일과 concern 기준으로 동일하게 선택한다.
- 아직 diff가 없다면 계획된 변경 surface를 기준으로 1차 선택하고, 구현 후 다시 확인한다.
- 하나의 concern이 여러 React section과 TypeScript/CSS companion rule을 동시에 활성화할 수 있다. 첫 match에서 멈추지 않고 모든 activated index entry를 끝까지 판정한다.
- selected rule의 `reviewWith` target은 초기 exact partition에서 `Selected`, 근거 있는 `N/A`, `Unknown` 중 하나여야 한다. `Unknown`은 contract/full-rule 증거로 완료 전에 해소하고, cross-skill target이면 companion activation도 다시 판정한다.

### 3. Rule Selection Receipt

코드를 바꾸기 전에 짧은 receipt를 유지한다.

```md
Activated: react, typescript, css
Indexes:
- react@sha256:<digest>
- typescript@sha256:<digest>
- css@sha256:<digest>
Selected:
- react: R12,R31 (composition-named-handlers-over-inline, state-use-functional-setstate-updates)
- typescript: T08 (docs-require-header-jsdoc-on-key-declarations)
- css: C04 (composition-compose-classes-with-clsx)
Not applicable:
- react: R01-R11,R13-R30,R32-R42
- typescript: T01-T07,T09-T22
- css: C01-C03,C05-C21
Excluded groups:
- react strategy: shared component API를 변경하지 않음
- css selector/values: selector와 token 값을 변경하지 않음
Unknown: none
Expanded: none
```

N/A rule은 ordinal range로 exact set을 남기고, section 또는 동일 조건의 rule group별 배제 근거를 덧붙인다. index의 모든 ordinal은 `selected`, `not applicable`, `unknown` 중 정확히 하나에 있어야 하며 중복과 누락이 없어야 한다. digest가 현재 generated index와 다르면 receipt를 재사용하지 않고 selection을 다시 수행한다.

receipt는 작업 중 audit packet으로 전달되는 ephemeral artifact이며 consuming product repository에 새 파일을 만들 필요는 없다. behavioral evaluation에서만 재현을 위해 JSON snapshot으로 보존한다.

### 4. Read selected contracts and deterministic full rules

receipt의 selected/unknown stable ID와 같은 이름인 `contracts/<stable-id>.md`를 모두 읽는다. CRITICAL contract는 full rule을 반드시 읽는다. non-CRITICAL은 exact syntax·예외 판단, contract와 코드만으로 해소되지 않는 Unknown, audit PASS evidence 부족일 때만 full rule로 확장하고 이유를 기록한다. `Unknown`은 contract와 필요한 full rule로 applicability를 확정한 뒤 비워야 한다.

### 5. Scope drift

새 파일, 새 abstraction, 새 CSS selector, 새 API/type boundary처럼 작업 surface가 넓어지면 index scan과 receipt를 갱신하고 추가 rule을 읽는다. 최초 selection을 끝까지 고정하지 않는다.

## Companion Skill Contract

- React는 TSX/TypeScript 언어 계약 때문에 TypeScript를 기본 companion으로 활성화한다.
- CSS는 stylesheet, selector, class contract 또는 visual styling surface가 실제로 변경될 때 활성화한다.
- CSS rule이 TS/TSX class contract, wrapper Props 또는 style import를 함께 다룰 때만 TypeScript를 conditional companion으로 활성화하며 pure CSS에서는 활성화하지 않는다.
- pure TypeScript 작업은 React/CSS를 자동 활성화하지 않는다.
- 기존 `metadata.json.extends`는 required와 conditional을 구분하지 못하므로 progressive skill의 activation 정본으로 사용하지 않는다. 대신 `metadata.json.companions`가 skill, mode, 적용 조건을 명시한다.
- 향후 Astro, NestJS 등도 같은 index contract로 migration할 수 있지만 이번 변경의 필수 범위는 아니다.

예시:

```json
{
  "companions": [
    {"skill": "typescript", "mode": "required"},
    {"skill": "css", "mode": "conditional", "appliesWhen": "class contract, stylesheet 또는 styling surface를 변경한다."}
  ]
}
```

React는 required TypeScript와 conditional CSS를 선언한다. `convention-audit`은 React, TypeScript, CSS를 모두 conditional로 선언하고 실제 changed surface로 활성화한다. 기존 non-progressive skill의 `extends`는 호환성을 위해 유지한다. build와 validate는 한 skill 안에서 `extends`와 `companions`를 동시에 선언하지 못하게 하며, local index에 companion rule을 flatten하지 않고 companion index link와 activation mode만 생성한다.

## Convention Audit Contract

`convention-audit`은 더 이상 React/CSS/TypeScript full `AGENTS.md` 세 개를 기본으로 읽지 않는다. 다음 순서로 동작한다.

1. changed files, diff, owner boundaries, runtime/visual evidence로 audit packet을 만든다.
2. 실제 변경 surface에 해당하는 companion skill을 활성화한다.
3. 각 activated `RULES_INDEX.md` 전체를 applicability 수준으로 scan한다.
4. selected 및 ambiguous stable ID와 같은 이름의 contract를 읽고 CRITICAL/근거가 필요한 full rule만 확장한다.
5. selected rule별 evidence와 verdict를 기록한다.
6. coverage count와 excluded-group reason을 검증한다.
7. `FAIL > 0` 또는 `UNKNOWN > 0`이면 구현 수정 또는 evidence 보강 후 다시 audit한다.

auditor는 구현자가 남긴 selection receipt를 그대로 신뢰하지 않는다. diff와 audit packet에서 applicability scan을 독립적으로 다시 수행하고 두 selection을 비교한다. 구현 receipt에서 applicable rule이 빠졌으면 그 rule의 본문 위반 여부와 관계없이 selection coverage `FAIL`로 판정한다.

두 receipt는 같은 index digest의 exact ordinal partition으로 비교한다. group count만 같거나 배제 설명만 있는 receipt는 audit evidence로 인정하지 않는다.

최종 요약은 다음을 포함한다.

```md
Activated indexes: react 42, typescript 22, css 21
Coverage: selected 9, not applicable 76, unknown 0
Verdicts: PASS 9, FAIL 0, UNKNOWN 0
Excluded groups: <compact reasons>
Reviewer: <independent reviewer or reported fallback>
```

lint, typecheck, build, browser 확인은 중요한 verification evidence지만 semantic convention verdict를 대신하지 않는다. 독립 reviewer를 사용할 수 있으면 receipt, diff, selected contract, `Expanded` full rule과 이유, 실행 증거를 넘긴다. 사용할 수 없으면 main-agent reviewer mode를 명시하고 같은 gate를 적용한다.

## Project `AGENTS.md` Policy

consuming project는 규칙 본문을 복사하지 않고 아래와 같은 짧은 activation policy만 둔다.

```md
## Frontend conventions

- React/TSX 변경 전 `convention-react`와 `convention-typescript`를 활성화한다.
- CSS, class contract, stylesheet 또는 styling surface 변경 시 `convention-css`도 활성화한다.
- 각 `SKILL.md`를 router로 사용하고, activated `RULES_INDEX.md`를 전부 scan한 뒤 선택한 `contracts/*.md`와 CRITICAL/근거가 필요한 `rules/*.md`만 읽는다.
- 일반 구현에서 compiled `AGENTS.md` 전체를 기본 로드하지 않는다.
- scope가 넓어지면 rule selection을 갱신한다.
- 완료 전 `convention-audit`을 수행하고 FAIL/UNKNOWN이 0이 될 때까지 수정한다.
```

프로젝트 고유 naming, 폴더 구조, 검증 명령은 이 policy 아래에 overlay로 둔다. 공통 React/TypeScript/CSS 규칙은 프로젝트마다 복제하지 않는다.

## Build 및 Schema 변경

package 구현은 다음 계약을 지원한다.

- `SkillRule.appliesWhen?: string`
- `SkillRule.reviewWith?: string[]`
- `SkillMetadata.progressiveDisclosure?: boolean`
- required/conditional을 구분하는 `SkillMetadata.companions?`
- `SkillPaths.rulesIndexPath`
- `SkillPaths.ruleContractsDir`
- rule index markdown generator
- compact contract renderer와 strict example-boundary validator
- canonical routing metadata digest와 compact ordinal generator
- progressive skill의 `appliesWhen` 존재, 한 줄, 길이 검증
- rule frontmatter의 unknown key, duplicate key, continuation line을 거부하는 strict scalar parser
- `reviewWith` target 존재 여부, companion 접근 가능성, 중복 id 검증
- index의 section/rule 순서, stable id, count와 같은 이름의 generated contract 1:1 검증
- `extends`/`companions` 상호 배타성, companion mode/condition, cycle, dedup 검증
- 기존 full `AGENTS.md` build 유지
- build log에서 handbook, index, contracts generated output을 구분
- generated index 없이 시작하는 clean build와 source 대비 stale generated index 검출

progressive 여부는 코드에 skill 이름을 흩뿌리지 않고 `metadata.json`의 명시적 설정으로 선언한다. 예시:

```json
{
  "progressiveDisclosure": true
}
```

이 설정이 없는 기존 structured skill은 `appliesWhen` 없이도 validate/build가 계속 통과한다. 설정된 skill은 `RULES_INDEX.md`가 필수 generated output이며 모든 local rule에 `appliesWhen`이 필요하다.

`isBuildableSkill`은 source인 `metadata.json`과 `_sections.md`만으로 판정한다. 아직 생성되지 않은 `RULES_INDEX.md`를 buildability 조건에 넣지 않는다. build는 index가 없는 clean fixture에서도 성공해야 한다. 기존 source `validate → build` 흐름을 깨뜨리지 않도록 stale 검출은 별도 generated-output check에서 source로 계산한 기대 문자열과 tracked output을 비교한다.

현재 frontmatter reader는 YAML parser가 아니라 한 줄 `key: scalar` parser다. 이번 schema에서도 배열이나 block scalar를 허용하지 않는다. 모든 non-empty frontmatter line은 알려진 key의 단일 scalar여야 하고, duplicate key, colon 없는 continuation, unknown key를 즉시 거부한다. 따라서 줄바꿈된 `appliesWhen`이 조용히 잘리는 false green을 막는다.

## RED-GREEN 검증 전략

### RED: 현재 구조의 실패를 먼저 고정

구현 전 자동화 테스트가 다음 이유로 실패해야 한다.

- progressive skill rule에 `appliesWhen` schema가 없다.
- build가 `RULES_INDEX.md`를 만들지 않는다.
- index의 rule completeness와 stable-ID-to-contract integrity를 검증할 수 없다.
- React/TypeScript/CSS router가 full `AGENTS.md`를 기본 로드한다.
- convention audit가 full companion guide를 기본 로드한다.

### GREEN: 구조 테스트

- parser가 `appliesWhen`을 읽는다.
- progressive skill에서 누락, 빈 값, 줄바꿈, duplicate/unknown key, 160자 초과를 거부한다.
- non-progressive skill은 기존 schema로 통과한다.
- build가 local rule을 정확히 한 번씩 index에 포함한다.
- index stable ID와 같은 이름의 generated contract가 정확히 하나 존재한다.
- generated digest가 routing metadata 변경에 반응하고 동일 입력에서는 byte-for-byte 재현된다.
- `reviewWith` local/cross-skill target이 모두 존재하고 selection closure가 fixture에서 검증된다.
- index가 없는 clean fixture에서 첫 build가 성공하고, source 변경 후 rebuild하지 않은 stale index를 generated-output check가 거부한다.
- section 및 rule 순서가 deterministic하다.
- React/TypeScript/CSS `SKILL.md`가 scope, full index scan, selected contract/required full expansion, receipt, drift, audit를 요구한다.
- router가 일반 작업에서 full `AGENTS.md`를 기본 로드하지 않는다.
- convention audit가 index coverage, selected contract/full expansion, FAIL/UNKNOWN gate를 요구한다.
- audit가 구현 receipt와 독립 reviewer selection을 비교한다.

### Pressure scenarios

최소 다음 mixed scenario를 baseline과 candidate에 각각 두 번 적용한다.

1. TSX inline callback을 named handler로 추출하고 derived/functional state update를 함께 수정
2. pure TS helper/type/JSDoc boundary 수정
3. 기존 CSS owner root 아래로 third-party selector를 제한하고 variable fallback 수정
4. TSX `className`과 stylesheet를 함께 수정
5. React query shaping 변경이지만 CSS/API schema는 변경하지 않음
6. 구현 중 shared abstraction 또는 new selector가 추가되어 scope가 넓어짐
7. 적용 여부가 애매한 HIGH rule이 있어 원문 확인이 필요한 경우
8. lint/build는 통과하지만 semantic rule을 위반한 경우

각 scenario에는 exact expected selected/not-applicable rule id partition과 forbidden full-handbook load를 기록한다. candidate가 impact와 관계없이 expected applicable rule을 하나라도 선택하지 못하면 실패다.

기존 pressure 문서만으로는 positive routing coverage가 React 28/42, TypeScript 18/22, CSS 16/21 rule에 그친다. runtime에 로드되지 않는 `routing-evals.json` manifest를 각 progressive skill에 추가해 세 skill의 모든 rule id가 최소 한 번은 `expectedSelected`에 등장하도록 한다. fixture는 `id`, changed `files`, `expectedSkills`, exact `expectedSelected`, exact `expectedNotApplicable`, `scopeDrift`를 명시하고 두 exact set이 해당 fixture의 activated index를 완전히 partition해야 한다. 자동화 테스트는 manifest의 unknown/duplicate id, 존재하지 않는 stable-ID-matched contract, companion closure와 rule coverage 100%를 검사한다. all-rules selection은 exact-set precision과 token gate에서 실패한다.

behavioral pressure 평가는 네 arm으로 비교한다.

1. no-skill baseline
2. full-handbook oracle
3. progressive candidate
4. expected rule 하나를 receipt에서 제거한 mutation RED

candidate는 oracle보다 추가 convention `FAIL`/`UNKNOWN`을 만들면 실패다. mutation arm은 coverage mismatch 또는 `UNKNOWN`으로 반드시 완료를 차단해야 한다. 각 mixed scenario는 최소 두 번, CRITICAL scenario는 가능하면 세 번 실행한다. oracle fixture는 `appliesWhen` 작성자와 다른 reviewer가 full rule body를 기준으로 승인해 self-validating evaluation을 피한다.

package test는 schema, build determinism, manifest integrity만 자동 검증할 수 있다. 실제 agent가 index를 읽고 scope drift 뒤 재선택하는 행동은 별도 behavioral run이 필요하다. 각 run은 repository HEAD, index digest, model/runtime/version, reasoning level, exact prompt, scorer와 rubric version, trial count, arm, declared loaded files, selection receipt, scorer verdict, token count를 `docs/evaluations/` snapshot으로 남긴다. runtime이 file-read telemetry를 제공하지 않으면 `declared loaded files`임을 명시하며 관측하지 못한 사실을 자동 PASS로 표현하지 않는다.

## Token 및 품질 합격선

최초 HEAD pilot 기준선은 React + TypeScript + CSS entrypoint와 full compiled guide를 한 번 로드한 38,102 `o200k_base` token이었다. contract-first source를 반영한 fixed context의 최종 one-load 기준선은 37,857 token이다. 선택 rule의 중복 로딩과 독립 audit/reviewer 재로딩은 이 수치에 포함하지 않는다.

최초 index + selected full-rule 구현을 실제 8개 context에 대입한 pilot은 implementation median 13,380, max 19,723, one-load 절감 64.8837%, cumulative 절감 48.698%로 네 token gate를 모두 실패했다. 따라서 routing 조건을 약화하지 않고 index의 중복 title/impact/tag를 제거하고 generated contract + CRITICAL full-rule expansion을 추가했다. named-handler/owner-selector 대표군과 실제 HIGH full-rule expansion까지 포함한 fixed context 재측정은 implementation median 8,669, max 11,785, one-load 절감 median 77.1007%, cumulative 절감 median 62.825%로 네 gate를 통과했으며, 최종 evidence에는 고정 HEAD, measured-file hash manifest와 contexts digest를 함께 기록한다.

후보 구조의 목표는 다음과 같다.

- 세 router + 세 index + representative selected contracts + required full rules의 median이 10,000 token 이하
- 가장 넓은 대표 mixed scenario도 12,000 token 이하
- 기준선 대비 one-load input context 감소 median 70% 이상
- pressure scenario의 expected applicable rule recall 100% (모든 impact)
- exact expected selection precision 100%와 domain activation recall 100%
- routing evaluation manifest의 전체 local rule positive coverage 100%
- selected rule semantic verdict의 FAIL/UNKNOWN 0
- irrelevant full handbook load 0회

위 10,000/12,000 기준은 구현 단계의 router + index + selected contract + required full-rule context다. 별도로 초기 selection, scope drift 재scan, convention audit, 독립 reviewer 전달 context를 모두 합친 end-to-end 누적 input을 같은 단계의 full-handbook workflow와 비교해 감소율 median 60% 이상이어야 한다.

토큰은 동일한 `o200k_base` tokenizer와 동일 파일 범위로 다시 측정한다. exact tokenizer 실행 환경을 repository에 고정할 수 없으면 재현 명령과 snapshot 결과를 문서화하고, 자동화 테스트에는 deterministic byte budget을 보조 guardrail로 둔다. full-handbook fallback이 발생하면 receipt와 snapshot에 이유를 적고 progressive token PASS에서 제외한다. token 감소만 통과하고 recall 또는 precision이 떨어지면 전체 변경은 실패로 본다.

## 호환성 및 Rollout

1. React, TypeScript, CSS rule에 `appliesWhen`을 추가하고 metadata flag를 켠다.
2. RED 테스트를 추가한 뒤 parser/validate/build를 구현한다.
3. 세 index를 생성하고 completeness를 검증한다.
4. 세 `SKILL.md`를 compact router로 바꾼다.
5. `convention-audit` router와 pressure tests를 바꾼다.
6. README, package README, 각 skill README와 template을 갱신한다.
7. 전체 build/validate/test/typecheck를 실행한다.
8. baseline/candidate pressure 및 token 측정을 수행한다.

구현은 schema/index/receipt 기반을 먼저 완성하고, TypeScript pilot으로 eval harness를 검증한 뒤 React/CSS와 companion closure, 마지막으로 independent convention audit를 연결한다. 각 phase는 같은 branch 안에서 다음 phase의 전제 조건으로 이어지며, pilot 결과만으로 전체 작업을 완료 처리하지 않는다.

기존 사용자가 `AGENTS.md`를 직접 링크한 경우 full handbook은 계속 동작한다. 다만 새 README는 일반 작업의 권장 경로를 `SKILL.md` → `RULES_INDEX.md` → selected `contracts/*.md` → CRITICAL/근거 기반 `rules/*.md`로 명확히 바꾼다.

## 위험과 대응

### index가 지나치게 짧아 규칙을 놓침

`appliesWhen`을 단순 주제가 아니라 관찰 가능한 code/diff trigger로 작성하고, 애매하면 `Unknown`에 둔 뒤 contract와 필요 시 full rule 증거로 완료 전에 해소한다. pressure scenario에서 impact와 관계없이 applicable rule recall 100%를 요구한다.

### index 자체가 또 다른 거대한 문서가 됨

entry schema와 160자 제한을 enforce하고 예시/설명을 넣지 않는다. token 및 byte budget을 회귀 검증한다.

### 초기 scope만 보고 후속 변경 규칙을 놓침

router와 audit 모두 scope drift 재선택을 필수 단계로 둔다.

### N/A 판정을 너무 쉽게 만들어 coverage가 형식화됨

index digest가 붙은 exact ordinal partition, section/group 단위 exclusion reason, 독립 reviewer selection 비교를 요구한다. 적용 여부가 애매하면 UNKNOWN으로 두고 원문을 읽어 해소한다.

### audit가 다시 모든 원문을 읽음

audit의 completeness는 index 전체 scan, digest가 붙은 exact partition, 독립 selection 비교로 확보하고, semantic guidance review는 selected/ambiguous contract와 required full rule에만 제한한다.

### metadata migration이 다른 skill을 깨뜨림

`progressiveDisclosure`가 켜진 skill에만 새 필드를 강제하고, 다른 structured skill의 기존 build 계약을 보존한다.

## 완료 조건

- React, TypeScript, CSS의 모든 local rule에 검증된 `appliesWhen`이 있다.
- 세 `RULES_INDEX.md`가 deterministic하게 생성되고 모든 local rule을 정확히 한 번 포함한다.
- index digest가 동일 입력에서 재현되고 receipt가 exact selected/N/A/unknown partition을 표현한다.
- index 없는 clean build와 stale generated-output 검출이 모두 검증된다.
- routing evaluation manifest가 세 skill의 local rule 100%를 positive fixture로 덮는다.
- 세 `SKILL.md`는 full handbook 기본 로딩 없이 scope → index scan → selection receipt → selected contract → required full expansion → drift → audit 흐름을 강제한다.
- `convention-audit`은 activated index 전체 coverage와 selected-rule semantic 검토를 수행한다.
- 기존 full `AGENTS.md`는 opt-in handbook으로 계속 생성된다.
- 프로젝트 `AGENTS.md`에는 복제 규칙이 아니라 짧은 activation policy만 필요하다.
- 전체 package test, validate, typecheck, build, diff check가 통과한다.
- 구조 test와 별개로 model/runtime/prompt/scorer가 기록된 behavioral evaluation snapshot이 있다.
- implementation 및 end-to-end token 합격선과 모든 impact의 pressure scenario recall/precision/verdict 합격선을 모두 만족한다.
