# TypeScript 컨벤션

에이전트 협업, 리뷰, AI 보조 리팩터링에 맞춰 TypeScript 컨벤션을 관리하는 구조화된 저장소입니다.  
현재 TypeScript 가이드는 6개 섹션의 22개 rule 파일로 구성되어 있습니다.  
일반 작업은 [SKILL.md](./SKILL.md) router와 generated [RULES_INDEX.md](./RULES_INDEX.md)로 필요한 `contracts/*.md`를 선택합니다. CRITICAL 또는 contract만으로 exact 판단할 수 없는 rule만 full source를 확장하며, 전체 [AGENTS.md](./AGENTS.md)는 full handbook이 필요한 경우의 opt-in 산출물입니다. 이 skill은 React, NestJS, TanStack Route, Playwright Test와 함께 로드하는 공통 TypeScript companion skill로도 사용됩니다.
[pressure-tests.md](./pressure-tests.md)는 skill 품질 회귀를 점검하는 synthetic/real-world pressure scenario 모음입니다.

## 구조

- [rules/_sections.md](./rules/_sections.md) - rule 섹션 구성 메타데이터
- [rules/_template.md](./rules/_template.md) - 새 rule 작성용 템플릿
- `area-description.md` - 실제 rule 파일 패턴
- [metadata.json](./metadata.json) - compiled guide 메타데이터
- [SKILL.md](./SKILL.md) - scope, exact partition, drift, audit를 강제하는 compact router
- [RULES_INDEX.md](./RULES_INDEX.md) - `appliesWhen`, stable ID, digest가 포함된 generated compact index
- `contracts/*.md` - selected/unknown용 generated normative contract; CRITICAL은 linked full rule 필수
- [routing-evals.json](./routing-evals.json) - runtime에 로드하지 않는 exact selection/N/A 검증 oracle
- [AGENTS.md](./AGENTS.md) - onboarding과 generated index/contract/필요 rule 손상·누락 fallback용 compiled full handbook
- [package/README.md](../../package/README.md) - `skill/*` build, validation, typecheck, test를 담당하는 standalone TypeScript npm package

## 시작하기

1. Validate rule files:
   ```bash
   npm --prefix ../../package run validate:typescript
   ```

2. Build [AGENTS.md](./AGENTS.md)와 [RULES_INDEX.md](./RULES_INDEX.md) from rules:
   ```bash
   npm --prefix ../../package run build:typescript
   ```

3. Validate and build together:
   ```bash
   npm --prefix ../../package run dev:typescript
   ```

4. Verify the build package itself:
   ```bash
   npm --prefix ../../package run typecheck
   npm --prefix ../../package run test
   ```

5. Generated output이 source와 같은지 read-only로 확인합니다.
   ```bash
   npm --prefix ../../package run check:generated:typescript
   ```

## 새 Rule 추가하기

1. [rules/_template.md](./rules/_template.md)를 `rules/area-description.md`로 복사합니다.
2. 알맞은 area prefix를 고릅니다.
   - `naming-` - 식별자, import, `config`/`util` namespace, 오리진 보존 접근 규칙
   - `types-` - 함수 타입, callback 재사용, unused param, 타입 재사용, custom shape 문서화 규칙
   - `functions-` - object param, enum 대체, lookup/정렬 불변성, owner module/`shared/util.ts` 추출 규칙
   - `absence-` - optional 값과 fallback 처리 규칙
   - `docs-` - 역할 기반 annotation 태그와 inline comment 규칙
   - `guardrails-` - 금지 shortcut과 review check 규칙
3. frontmatter와 본문을 작성합니다.
4. normative 본문을 첫 `Incorrect` 앞에 완결하고 설명이 포함된 fenced incorrect/correct 예시를 넣습니다. 첫 `Incorrect` 뒤에는 example label, fenced code, 빈 줄만 둡니다.
5. `npm --prefix ../../package run dev:typescript`를 실행해 [AGENTS.md](./AGENTS.md), [RULES_INDEX.md](./RULES_INDEX.md), `contracts/*.md`를 다시 생성합니다.

## Rule 파일 구조

각 rule 파일은 아래 구조를 따릅니다.

````markdown
---
title: Rule Title Here
impact: MEDIUM
impactDescription: 선택적 영향도 설명
appliesWhen: 이 rule을 선택해야 하는 변경 surface와 evidence를 한 문장으로 설명
reviewWith: 함께 재평가할 local-rule-id, companion-skill/cross-rule-id
tags: tag1, tag2
---

## Rule Title Here

**Impact: MEDIUM (선택적 영향도 설명)**

규칙의 핵심과 이유를 짧고 분명하게 설명합니다.

**Incorrect (무엇이 문제인지 설명):**

```ts
// 나쁜 예시
```

**Correct (무엇이 좋아졌는지 설명):**

```ts
// 좋은 예시
```
````

## 파일명 규칙

- `_`로 시작하는 파일은 특수 파일이며 compiled guide에서 제외됩니다.
- Rule 파일은 `area-description.md` 형식을 사용합니다. 예: `types-document-custom-types-and-shapes.md`
- Section은 파일명 prefix로 결정됩니다.
- Rule은 각 section 안에서 title 기준 알파벳 순으로 정렬됩니다.
- [AGENTS.md](./AGENTS.md)의 rule 번호는 자동 생성됩니다.
- `appliesWhen`은 한 줄, 160자 이하로 작성합니다. `reviewWith`는 자동 선택 목록이 아니라 관련 rule 재평가 hint입니다. Selected contract와 Unknown→Selected로 확정된 필수 변경만 scope evidence에 합치고, 예시·선택적 대안·아직 해소되지 않은 Unknown의 가상 변경은 제외한 채 고정점까지 반복 판정하며, 대상이 없으면 key 자체를 생략합니다.

## Progressive routing workflow

1. [SKILL.md](./SKILL.md)에서 scope snapshot을 고정합니다.
2. [RULES_INDEX.md](./RULES_INDEX.md)를 처음부터 끝까지 scan하고 첫 match에서 멈추지 않습니다.
3. digest에 묶인 `Selected`, `N/A`, `Unknown` exact partition과 비어 있지 않은 exclusion evidence를 기록합니다.
4. `Selected`와 `Unknown` stable ID와 같은 이름인 `contracts/<stable-id>.md`를 읽습니다. CRITICAL은 full rule을 필수로 읽고, 나머지는 exact syntax·예외·Unknown·audit 근거에 필요할 때만 확장해 `Expanded: ID: reason`을 남깁니다.
5. `Unknown`을 해소하고, Selected contract와 Unknown→Selected로 확정된 필수 변경만 scope evidence에 합칩니다. 예시·선택적 대안·아직 해소되지 않은 Unknown의 가상 변경은 제외하고 새 Selected/Unknown contract 로드와 전체 index/`reviewWith` 재판정을 고정점까지 반복합니다.
6. 고정점의 Selected 규범을 구현하고 scope drift가 생기면 전체 index와 receipt를 다시 계산합니다.

## Impact 레벨

- `CRITICAL` - 타입 안정성, 계약, 파일 간 일관성에 직접 영향할 가능성이 큰 최우선 규칙
- `HIGH` - 유지보수성과 가독성에 큰 영향을 주는 규칙
- `MEDIUM-HIGH` - 일반적인 구현 작업에서 강하게 권장되는 규칙
- `MEDIUM` - 일관성과 리뷰 규율에는 중요하지만 핵심 흐름 규칙보다는 우선순위가 낮은 규칙
- `LOW` - 상황이 맞을 때 적용하면 좋은 보강 규칙

## 스크립트

- `npm --prefix ../../package run build:typescript` - TypeScript rule을 compile해 [AGENTS.md](./AGENTS.md), [RULES_INDEX.md](./RULES_INDEX.md), `contracts/*.md` 생성
- `npm --prefix ../../package run validate:typescript` - TypeScript rule만 검증
- `npm --prefix ../../package run check:generated:typescript` - TypeScript generated index stale 여부를 파일 수정 없이 검증
- `npm --prefix ../../package run dev:typescript` - TypeScript만 validate 후 build까지 연속 실행
- `npm --prefix ../../package run build:all` - `skill/` 아래 build 가능한 skill 전체 build
- `npm --prefix ../../package run validate:all` - `skill/` 아래 build 가능한 skill 전체 validate
- `npm --prefix ../../package run dev:all` - `skill/` 아래 build 가능한 skill 전체 validate + build
- `npm --prefix ../../package run typecheck` - standalone build package 타입 검사
- `npm --prefix ../../package run test` - build package용 CLI/파서/문서 회귀 테스트 실행
- `cd ../../package && npm run build:typescript` - package 로컬 위치에서 TypeScript build 스크립트 직접 실행

## 마이그레이션 메모

- [rules/_sections.md](./rules/_sections.md), [rules/_template.md](./rules/_template.md), `rules/*.md`가 source of truth입니다.
- 일반 작업에서는 [SKILL.md](./SKILL.md)와 [RULES_INDEX.md](./RULES_INDEX.md)를 먼저 사용하고 selected/unknown `contracts/*.md`, CRITICAL 또는 근거가 필요한 `rules/*.md`만 읽습니다.
- [AGENTS.md](./AGENTS.md)는 full handbook/onboarding 요청이나 generated index/contract/필요 rule 손상·누락 fallback에서만 사용합니다.
- 예전 단일 문서는 보존하지 않습니다. 오래된 문맥은 Git history에서만 확인하고, 규범의 정본은 source rule이며 일반 작업은 generated index/contract, full handbook은 opt-in 경로로 판단합니다.
- progressive skill은 `metadata.json.companions`에서 required/conditional 관계를 구분해 이 skill을 선언합니다. `extends`는 아직 migration하지 않은 non-progressive skill의 호환 계약에만 사용합니다.
- 공용 TypeScript build package는 raw CLI 형태와 per-skill alias를 모두 제공합니다.

## 기여 가이드

rule을 추가하거나 수정할 때는 아래 순서를 따릅니다.

1. section에 맞는 filename prefix를 사용합니다.
2. [_template.md](./rules/_template.md) 구조를 따릅니다.
3. 예시는 실제 TypeScript 모듈, `shared/config.ts`, `shared/util.ts`, owner module, 계약 코드와 가깝고 구체적으로 작성합니다.
4. 새 카테고리를 추가했다면 section metadata도 함께 갱신합니다.
5. 마무리 전에 `npm --prefix ../../package run dev:typescript`를 실행합니다.
