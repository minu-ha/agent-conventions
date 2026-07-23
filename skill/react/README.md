# React 컨벤션

에이전트 협업, 리뷰, AI 보조 리팩터링에 맞춰 React 컨벤션을 관리하는 구조화된 저장소입니다.
현재 React 가이드는 8개 local 섹션의 42개 rule 파일로 구성되어 있습니다.
기본 진입점은 compact [SKILL.md](./SKILL.md) router와 generated [RULES_INDEX.md](./RULES_INDEX.md)이며, 전체 [AGENTS.md](./AGENTS.md)는 opt-in full handbook입니다.
이 skill은 TanStack Query, Zustand, React 19 ref prop/Activity/useEffectEvent/transition 패턴을 쓰는 React codebase를 기본 전제로 합니다.

## 구조

- [rules/_sections.md](./rules/_sections.md) - rule 섹션 구성 메타데이터
- [rules/_template.md](./rules/_template.md) - 새 rule 작성용 템플릿
- `area-description.md` - 실제 rule 파일 패턴
- [metadata.json](./metadata.json) - progressive routing과 companion activation 메타데이터
- [SKILL.md](./SKILL.md) - 전체 index scan과 exact receipt를 요구하는 compact router
- [RULES_INDEX.md](./RULES_INDEX.md) - ordinal, stable ID, `appliesWhen`, `completionGate`, `reviewWith`, digest를 담은 generated index
- `contracts/*.md` - selected/unknown이 기본 로드하는 generated normative contract와 `requiresSelected` metadata; CRITICAL은 full rule 필수 로드 지시
- [routing-evals.json](./routing-evals.json) - 15개 scenario와 16개 stage의 exact Selected/N/A routing oracle
- [AGENTS.md](./AGENTS.md) - full handbook 요청 또는 generated index/contract/필요 rule 손상·누락 fallback에만 읽는 compiled 결과물
- [pressure-tests.md](./pressure-tests.md) - behavioral/token 회귀 실행 절차
- [package/README.md](../../package/README.md) - build, validation, typecheck, test tooling

## 시작하기

```bash
npm --prefix ../../package run validate:react
npm --prefix ../../package run build:react
npm --prefix ../../package run check:generated:react
npm --prefix ../../package run typecheck
npm --prefix ../../package run test
```

`dev:react`는 validate 후 build를 연속 실행합니다. generated 파일이 source와 일치하는지만 확인할 때는 `check:generated:react`를 사용합니다.

## 새 Rule 추가하기

1. [rules/_template.md](./rules/_template.md)를 `rules/area-description.md`로 복사합니다.
2. 알맞은 prefix를 선택합니다.
   - `ownership-` - shared/local 소유 경계와 파일 배치
   - `typing-` - React handler, callback, props 계약
   - `strategy-` - single, compound, explicit variant 선택
   - `composition-` - component signature, JSX, React 19 구조
   - `screen-` - route entry와 support code 추출 경계
   - `events-` - handler naming과 interaction flow
   - `state-` - server/store/derived state와 transition
   - `docs-` - React boundary documentation과 comments
3. observable 변경 surface를 설명하는 `appliesWhen`을 작성합니다.
4. 필수 target은 `requiresSelected`, 조건부 재평가는 `reviewWith`, 실제 skill 완료 gate는 `requiredOnCompletion: true`로 구분합니다.
5. normative 본문을 첫 `Incorrect` 앞에 완결하고 incorrect/correct fenced 예시를 작성한 뒤 validate/build/check를 실행합니다. 첫 `Incorrect` 뒤에는 example label, fenced code, 빈 줄만 둡니다.

## Rule frontmatter

```markdown
---
title: Rule Title Here
impact: MEDIUM
impactDescription: 선택적 영향도 설명
appliesWhen: 이 rule을 선택해야 하는 변경 surface와 evidence를 한 문장으로 설명
requiresSelected: source가 Selected이면 반드시 Selected일 local-rule-id, companion-skill/cross-rule-id
requiredOnCompletion: true
reviewWith: 조건부로 다시 판정할 local-rule-id, companion-skill/cross-rule-id
tags: tag1, tag2
---
```

- `appliesWhen`은 비어 있지 않은 한 줄 문장이며 160자를 넘기지 않습니다.
- `requiresSelected`는 source가 최종 Selected일 때 target도 논리적으로 반드시 Selected인 경우만 사용합니다. target companion도 활성화하며 N/A를 허용하지 않습니다.
- `reviewWith`는 다른 rule을 자동 선택하는 명령이 아니라 현재 scope에서 조건부로 다시 판정하는 재평가 hint입니다. 근거가 있으면 target은 N/A일 수 있습니다.
- `requiredOnCompletion: true`는 활성 skill 전체의 실제 finish gate에만 사용합니다.
- 재평가하거나 필수 전이할 대상이 없으면 해당 optional key를 생략하고, 같은 target을 `requiresSelected`와 `reviewWith`에 중복하지 않습니다.
- `_`로 시작하는 파일은 generated guide에서 제외합니다.
- section은 filename prefix로 결정되고 ordinal은 title codepoint 순서로 자동 생성됩니다.

## Progressive routing workflow

1. [SKILL.md](./SKILL.md)에서 scope snapshot과 companion activation을 고정합니다.
2. [RULES_INDEX.md](./RULES_INDEX.md)를 처음부터 끝까지 scan하고 첫 match에서 멈추지 않습니다.
3. digest에 묶인 `Selected`, `N/A`, `Unknown` exact partition과 비어 있지 않은 exclusion evidence를 기록하고 `completionGate`는 Selected로 둡니다.
4. `Selected`와 `Unknown` stable ID와 같은 이름인 `contracts/<stable-id>.md`를 모두 읽습니다. CRITICAL은 full rule을 필수로 읽고, 나머지는 exact syntax·예외·Unknown·audit 근거에 필요할 때만 확장해 `Expanded: ID: reason`을 남깁니다.
5. `Unknown`을 먼저 Selected/N/A로 해소합니다. N/A contract는 전이시키지 않고, final Selected contract의 `requiresSelected` target만 companion까지 즉시 Selected로 닫습니다.
6. final Selected contract의 필수 변경만 scope evidence에 합칩니다. 예시·선택적 대안·미해소 Unknown은 제외하고 새 contract 로드와 모든 활성 index/`reviewWith` 재판정을 고정점까지 반복합니다.
7. 고정점의 Selected 규범을 구현하고 scope drift가 생기면 모든 활성 progressive index와 receipt를 다시 계산합니다.

React가 활성화되면 TypeScript companion은 항상 required입니다. CSS는 `class contract, stylesheet 또는 styling surface를 변경한다.`는 조건에서만 활성화합니다. Route/search/navigation이나 browser test surface가 바뀌면 각각의 전용 skill도 별도로 판정합니다.
모든 활성 skill은 자신의 `SKILL.md`를 먼저 따릅니다. `progressiveDisclosure: true`이고 `RULES_INDEX.md`가 있는 skill만 전체 index와 digest receipt를 사용하며, non-progressive skill은 해당 `SKILL.md`가 안내하는 `AGENTS.md`와 rule 원문을 읽습니다.

## Pressure Tests

[pressure-tests.md](./pressure-tests.md)는 같은 fixture를 no-skill baseline, full-handbook oracle, progressive candidate, mutation RED 네 arm으로 실행합니다. exact selection recall/precision과 input token을 함께 비교하며, deterministic manifest 검증은 실제 agent 행동 평가를 대체하지 않습니다.

## 마이그레이션과 유지보수

- [rules/_sections.md](./rules/_sections.md), [rules/_template.md](./rules/_template.md), `rules/*.md`가 source of truth입니다.
- [RULES_INDEX.md](./RULES_INDEX.md), `contracts/*.md`, [AGENTS.md](./AGENTS.md)는 generated 결과물이므로 직접 수정하지 않습니다.
- [routing-evals.json](./routing-evals.json)은 모든 activated progressive index의 exact selected/N/A partition과 100% positive rule coverage를 유지합니다.
- generic TypeScript 규칙은 [../typescript](../typescript/README.md), styling 규칙은 [../css](../css/README.md)가 정본이고 React에는 framework overlay만 둡니다.
- 예전 단일 문서는 보존하지 않으며 필요한 이력은 Git history에서 확인합니다.
