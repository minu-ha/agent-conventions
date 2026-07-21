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
- [RULES_INDEX.md](./RULES_INDEX.md) - ordinal, stable ID, `appliesWhen`, `reviewWith`, digest를 담은 generated index
- [routing-evals.json](./routing-evals.json) - 15개 scenario와 16개 stage의 exact Selected/N/A routing oracle
- [AGENTS.md](./AGENTS.md) - full handbook 요청 또는 index 손상 fallback에만 읽는 compiled 결과물
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
4. 함께 재평가할 rule이 있을 때만 `reviewWith`를 추가합니다.
5. incorrect/correct 예시와 본문을 작성하고 validate/build/check를 실행합니다.

## Rule frontmatter

```markdown
---
title: Rule Title Here
impact: MEDIUM
impactDescription: 선택적 영향도 설명
appliesWhen: 이 rule을 선택해야 하는 변경 surface와 evidence를 한 문장으로 설명
tags: tag1, tag2
---
```

- `appliesWhen`은 비어 있지 않은 한 줄 문장이며 160자를 넘기지 않습니다.
- `reviewWith`는 다른 rule을 자동 선택하는 명령이 아니라 현재 scope에서 다시 판정하게 하는 재평가 hint입니다.
- 재평가 대상이 없으면 `reviewWith` key를 생략합니다. 대상이 있을 때만 local stable ID 또는 `companion/rule-id`를 쉼표로 구분합니다.
- `_`로 시작하는 파일은 generated guide에서 제외합니다.
- section은 filename prefix로 결정되고 ordinal은 title codepoint 순서로 자동 생성됩니다.

## Progressive routing workflow

1. [SKILL.md](./SKILL.md)에서 scope snapshot과 companion activation을 고정합니다.
2. [RULES_INDEX.md](./RULES_INDEX.md)를 처음부터 끝까지 scan하고 첫 match에서 멈추지 않습니다.
3. digest에 묶인 `Selected`, `N/A`, `Unknown` exact partition과 비어 있지 않은 exclusion evidence를 기록합니다.
4. `Selected`와 `Unknown` 원문을 모두 읽고 `Unknown`을 해소합니다.
5. scope drift가 생기면 모든 활성 progressive index와 receipt를 다시 계산합니다.

React가 활성화되면 TypeScript companion은 항상 required입니다. CSS는 `class contract, stylesheet 또는 styling surface를 변경한다.`는 조건에서만 활성화합니다. Route/search/navigation이나 browser test surface가 바뀌면 각각의 전용 skill도 별도로 판정합니다.
모든 활성 skill은 자신의 `SKILL.md`를 먼저 따릅니다. `progressiveDisclosure: true`이고 `RULES_INDEX.md`가 있는 skill만 전체 index와 digest receipt를 사용하며, non-progressive skill은 해당 `SKILL.md`가 안내하는 `AGENTS.md`와 rule 원문을 읽습니다.

## Pressure Tests

[pressure-tests.md](./pressure-tests.md)는 같은 fixture를 no-skill baseline, full-handbook oracle, progressive candidate, mutation RED 네 arm으로 실행합니다. exact selection recall/precision과 input token을 함께 비교하며, deterministic manifest 검증은 실제 agent 행동 평가를 대체하지 않습니다.

## 마이그레이션과 유지보수

- [rules/_sections.md](./rules/_sections.md), [rules/_template.md](./rules/_template.md), `rules/*.md`가 source of truth입니다.
- [RULES_INDEX.md](./RULES_INDEX.md)와 [AGENTS.md](./AGENTS.md)는 generated 결과물이므로 직접 수정하지 않습니다.
- [routing-evals.json](./routing-evals.json)은 모든 activated progressive index의 exact selected/N/A partition과 100% positive rule coverage를 유지합니다.
- generic TypeScript 규칙은 [../typescript](../typescript/README.md), styling 규칙은 [../css](../css/README.md)가 정본이고 React에는 framework overlay만 둡니다.
- 예전 단일 문서는 보존하지 않으며 필요한 이력은 Git history에서 확인합니다.
