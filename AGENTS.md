# AGENTS.md

이 문서는 이 저장소에서 작업하는 AI coding agent를 위한 작업 가이드입니다.

## Repository Overview

이 레포는 팀 공용 coding convention을 skill pack 형태로 관리합니다.

- 실제 skill은 `skill/` 아래에 있습니다.
- structured skill의 build/validate tooling은 [package/](./package/README.md) 아래에 있습니다.
- [reference/](./reference/agent-skills-main/README.md)는 비교용 레퍼런스이며 source of truth가 아닙니다.

루트 [README.md](./README.md)는 사람용 온보딩 문서이고, 이 문서는 agent용 작업 규칙입니다.

## Skill Types

현재 이 레포에는 두 가지 구조가 공존합니다.

### 1. Structured Skill

대상:

- [skill/astro](./skill/astro/README.md)
- [skill/react](./skill/react/README.md)
- [skill/css](./skill/css/README.md)
- [skill/tanstack-route](./skill/tanstack-route/README.md)
- [skill/playwright-test](./skill/playwright-test/README.md)
- [skill/typescript](./skill/typescript/README.md)
- [skill/nestjs](./skill/nestjs/README.md)
- [skill/figma-visual-parity](./skill/figma-visual-parity/README.md)
- [skill/convention-audit](./skill/convention-audit/README.md)

이 구조에서는 아래 원칙을 지킵니다.

- 각 structured skill의 [rules/_sections.md](./skill/react/rules/_sections.md), [rules/_template.md](./skill/react/rules/_template.md), `rules/*.md`가 source of truth입니다.
- `SKILL.md`는 사람이 수정하는 activation/load router이며, progressive skill에서는 compact하게 유지합니다.
- `progressiveDisclosure: true`인 skill은 [RULES_INDEX.md](./skill/react/RULES_INDEX.md)를 generated compact index로 사용합니다.
- progressive skill의 `contracts/*.md`는 source `rules/*.md`에서 build한 selected-rule contract입니다. CRITICAL contract는 full rule을 반드시 가리킵니다.
- progressive React/TypeScript/CSS의 `AGENTS.md`는 generated opt-in full handbook이며 기본 진입점으로 로드하지 않습니다.
- `metadata.json.companions`는 `required` companion과 `conditional` companion의 활성화 관계를 선언합니다. `extends`는 아직 progressive migration을 하지 않은 non-progressive skill의 호환 계약입니다.
- `routing-evals.json`은 runtime에 로드하지 않는 test oracle이며 exact Selected/N/A partition과 scope-drift 시나리오를 검증합니다.
- `metadata.json`, [rules/_sections.md](./skill/react/rules/_sections.md), [README.md](./skill/react/README.md), [SKILL.md](./skill/react/SKILL.md)는 서로 설명이 어긋나지 않게 유지합니다.
- progressive skill의 현재 판단은 `SKILL.md`, generated `RULES_INDEX.md`, 선택된 `contracts/*.md`, 필요 시 확장한 `rules/*.md`를 기준으로 합니다. non-progressive skill은 `SKILL.md`가 안내하는 `AGENTS.md`와 rule 원문을 따릅니다.

### 2. Legacy Skill

대상:

- [skill/java](./skill/java/SKILL.md)

이 구조에서는 단일 문서가 정본입니다. structured skill 규칙을 억지로 섞지 말고, 실제 파일 구조를 먼저 확인한 뒤 수정합니다.

## Structured Skill Artifact Contract

| Artifact | Role |
| --- | --- |
| `rules/_sections.md`, `rules/_template.md`, `rules/*.md` | Editable rule source of truth. |
| `metadata.json` | Editable build and companion activation contract. |
| `SKILL.md` | Editable activation/load router; compact for progressive skills. |
| `RULES_INDEX.md` | Progressive-only generated compact index. |
| `contracts/*.md` | Progressive-only generated selected-rule contract; never edit directly. |
| `AGENTS.md` | Generated full handbook; opt-in for progressive React/TypeScript/CSS. |
| `routing-evals.json` | Progressive-only editable test oracle; never runtime context. |

non-progressive structured skill은 각 `SKILL.md`가 지정한 local `AGENTS.md`와 rule body 계약을 그대로 따릅니다. 위 opt-in 제한은 progressive React/TypeScript/CSS full handbook에만 적용합니다.

## Editing Rules

structured skill을 수정할 때는 아래 순서를 기본으로 사용합니다.

1. 먼저 [SKILL.md](./skill/react/SKILL.md), [README.md](./skill/react/README.md), `metadata.json`, [rules/_sections.md](./skill/react/rules/_sections.md)를 훑어 현재 구성과 activation 흐름을 확인합니다.
2. 실제 규칙 변경은 `rules/_sections.md`, `rules/_template.md`, `rules/*.md`를 수정합니다. activation/load 흐름이 바뀌면 `SKILL.md`를 수정하고, progressive routing 조건이 바뀌면 rule frontmatter의 `appliesWhen`/`reviewWith`와 `routing-evals.json`도 함께 수정합니다.
3. 공통 규칙은 companion skill에 두고 framework/project 특화 예외만 local overlay에 남깁니다. 기존 프로젝트 경계를 공통 pack으로 끌어올리지 않습니다.
4. `metadata.json.companions`의 `required`/`conditional` mode 또는 non-progressive `extends`가 현재 activation 계약과 맞는지 확인합니다.
5. [skill/react/AGENTS.md](./skill/react/AGENTS.md), [skill/react/RULES_INDEX.md](./skill/react/RULES_INDEX.md), `skill/react/contracts/*.md` 같은 generated 파일을 직접 편집하지 않습니다.
6. 변경 후 `validate` → `build` → `check:generated` 순서로 source와 generated output을 검증합니다.
7. skill 인벤토리, artifact 역할, activation 흐름이 바뀌면 루트 [README.md](./README.md)와 [package/README.md](./package/README.md)도 함께 갱신합니다.

새 skill을 추가하거나 legacy skill을 structured skill로 마이그레이션할 때는 가능하면 이미 정리된 `react`, `css`, `typescript` 폴더를 기준 템플릿으로 삼는 편이 안전합니다.

## Commands

의존성 설치:

```bash
npm --prefix package install
```

단일 structured skill 검증:

```bash
npm --prefix package run validate -- --skill=<skill-name>
```

단일 structured skill build:

```bash
npm --prefix package run build -- --skill=<skill-name>
```

전체 structured skill 검증/생성:

```bash
npm --prefix package run validate -- --all
npm --prefix package run build -- --all
npm --prefix package run check:generated:all
npm --prefix package run typecheck
npm --prefix package run test
```

현재 buildable skill alias는 아래와 같습니다.

- `astro`
- `react`
- `css`
- `convention-audit`
- `figma-visual-parity`
- `nestjs`
- `playwright-test`
- `tanstack-route`
- `typescript`

`java`는 현재 build pipeline 대상이 아닙니다.

## Guardrails

- structured skill에서는 [rules/_sections.md](./skill/react/rules/_sections.md), [rules/_template.md](./skill/react/rules/_template.md), `rules/*.md`를 우선 수정하고 generated [AGENTS.md](./skill/react/AGENTS.md)나 [RULES_INDEX.md](./skill/react/RULES_INDEX.md)를 직접 고친 뒤 끝내지 않습니다.
- generic TypeScript 규칙이면 `typescript` companion skill로 올리고, framework skill에는 예외나 overlay만 남기는 쪽을 우선 검토합니다.
- progressive consumer 경로는 compact router와 index입니다. full handbook은 명시적으로 전체 문맥이 필요할 때만 opt-in합니다.
- 레포 안의 skill마다 구조가 다를 수 있으므로, 수정 전에 실제 디렉터리 상태를 다시 확인합니다.
- `reference/agent-skills-main`의 문장을 그대로 가져오기보다, 이 레포의 목적과 현재 구조에 맞게 재서술합니다.
- skill 이름, 설명, 섹션 구성, generated output이 서로 어긋나면 이후 유지보수가 어려워지므로 한 번에 같이 맞춥니다.
- 루트 문서를 갱신할 때는 현재 지원 skill 목록과 build 가능 여부를 실제 상태 기준으로 적습니다.
