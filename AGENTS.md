# AGENTS.md

이 저장소에서 작업하는 AI coding agent 용 규칙.
**이 문서는 이 레포 전용이다.** 다른 프로젝트에 쓸 시작 템플릿은
[AGENTS.template.md](./AGENTS.template.md) 이고 이 레포와 무관하게 독립적으로 쓴다.

```text
┌─────────────────────────────────────────────────────────────────┐
│                       rules/*.md  (정본)                        │
│                                                                 │
│           사람이 고치는 유일한 곳. 규칙 본문이 여기 있다        │
│                                │                                │
└────────────────────────────────┬────────────────────────────────┘
                                 │  build
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│      HANDBOOK.md   ·   RULES_INDEX.md   ·   contracts/*.md      │
│                                                                 │
│          생성물. 직접 고치면 다음 build 에서 덮어써진다         │
│                                │                                │
└────────────────────────────────┬────────────────────────────────┘
                                 │  에이전트가 읽음
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SKILL.md 가 경로를 정한다                   │
│                                                                 │
│   progressive   RULES_INDEX → 걸리는 contracts → 필요시 rules   │
│   전체 로드     HANDBOOK.md 통째로                              │
└─────────────────────────────────────────────────────────────────┘
```

| 절 | 내용 |
| --- | --- |
| [1. 원칙](#1-원칙) | 무엇을 고치고 무엇을 건드리지 않는가 |
| [2. Skill Types](#2-skill-types) | 대상 skill 목록 |
| [3. Structured Skill Artifact Contract](#3-structured-skill-artifact-contract) | 정본과 생성물 |
| [4. Editing Rules](#4-editing-rules) | 수정 순서 |
| [5. Commands](#5-commands) | 검증 명령 |
| [6. Guardrails](#6-guardrails) | 하지 말 것 |

사람용 문서는 [ONBOARDING.md](./ONBOARDING.md)(시작하기)와
[CONTRIBUTING.md](./CONTRIBUTING.md)(규칙 고치기).
build tooling 은 [package/](./package/README.md).
[reference/](./reference/agent-skills-main/README.md) 는 비교용이며 정본이 아니다.

## 1. 원칙

1. **정본만 고친다** — `rules/*.md`. 생성물을 고치고 끝내지 않는다.
2. **최소 변경** — 요청 범위 밖 리팩터링 금지. 인접 코드 "개선" 금지.
3. **검증 후 보고** — `validate` → `build` → `check:generated` 실행 결과로 말한다.
4. **모르면 묻는다** — 추측으로 규칙 의미를 바꾸지 않는다.

## 2. Skill Types

모든 skill 이 structured skill 이다.

| Skill | Loading |
| --- | --- |
| [skill/react](./skill/react/HANDBOOK.md) | progressive |
| [skill/typescript](./skill/typescript/HANDBOOK.md) | progressive |
| [skill/css](./skill/css/HANDBOOK.md) | progressive |
| [skill/astro](./skill/astro/HANDBOOK.md) | 전체 로드 |
| [skill/tanstack-route](./skill/tanstack-route/HANDBOOK.md) | 전체 로드 |
| [skill/playwright-test](./skill/playwright-test/HANDBOOK.md) | 전체 로드 |
| [skill/nestjs](./skill/nestjs/HANDBOOK.md) | 전체 로드 |
| [skill/figma-visual-parity](./skill/figma-visual-parity/HANDBOOK.md) | 전체 로드 |

1. **progressive** — `SKILL.md` → `RULES_INDEX.md` → 걸리는 `contracts/*.md`
2. **전체 로드** — `SKILL.md` 가 지시하는 `HANDBOOK.md` 통째로
3. `metadata.json.companions` 가 `required` / `conditional` 활성화를 선언한다.
   `extends` 는 아직 progressive 로 옮기지 않은 skill 의 호환 계약이다.

## 3. Structured Skill Artifact Contract

| Artifact | Role |
| --- | --- |
| `rules/_sections.md`, `rules/_template.md`, `rules/*.md` | Editable rule source of truth. |
| `metadata.json` | Editable build and companion activation contract. |
| `SKILL.md` | Editable activation/load router; compact for progressive skills. |
| `RULES_INDEX.md` | Progressive-only generated compact index. |
| `contracts/*.md` | Progressive-only generated selected-rule contract; never edit directly. |
| `HANDBOOK.md` | Generated full handbook; progressive rules include `Applies when`. |
| `routing-evals.json` | Progressive-only editable test oracle; never runtime context. |

정리하면, 사람이 직접 수정하는 정본은
`rules/_sections.md`, `rules/_template.md`, `rules/*.md`, `metadata.json`, `SKILL.md`,
progressive `routing-evals.json` 이다.
`HANDBOOK.md`, progressive `RULES_INDEX.md`, progressive `contracts/*.md` 는 생성물이다.

## 4. Editing Rules

1. `SKILL.md`, `metadata.json`, `rules/_sections.md` 를 먼저 훑어 현재 구성을 확인한다.
2. 규칙 변경은 `rules/_sections.md`, `rules/_template.md`, `rules/*.md`를 수정한다.
   활성화 흐름이 바뀌면 `SKILL.md`, 라우팅 조건이 바뀌면 rule frontmatter 와
   `routing-evals.json` 도 함께 고친다.
3. 공통 규칙은 companion skill 로, framework/project 예외만 local overlay 로 둔다.
4. `metadata.json.companions` 의 mode 가 현재 활성화 계약과 맞는지 확인한다.
5. 생성물(`HANDBOOK.md`, `RULES_INDEX.md`, `contracts/*.md`)은 직접 편집하지 않는다.
6. `validate` → `build` → `check:generated` 순서로 검증한다.
7. skill 인벤토리나 artifact 역할이 바뀌면 [README.md](./README.md),
   [CONTRIBUTING.md](./CONTRIBUTING.md), [package/README.md](./package/README.md) 도 갱신한다.

새 skill 을 추가할 때는 이미 정리된 `react`, `typescript`, `css` 를 템플릿으로 삼는다.

### 4.1 routing 키의 의미

| 키 | 동작 |
| --- | --- |
| `appliesWhen` | 이 규칙이 걸리는 조건. 한 줄, 160자 이내 |
| `requiresSelected` | 함께 적용하는 필수 관계. cross-skill 이면 companion 도 활성화 |
| `reviewWith` | 재평가 힌트. 자동 적용 아님. **방향 있음 — 역방향 추론 금지** |
| `requiredOnCompletion` | 마무리 시 항상 적용 |

## 5. Commands

```bash
npm --prefix package install                       # 처음 한 번
npm --prefix package run dev:<skill>               # validate + build
npm --prefix package run validate -- --all
npm --prefix package run build -- --all
npm --prefix package run check:generated:all
npm --prefix package run check:handbooks:all
npm --prefix package run test
```

buildable skill: `astro` `css` `figma-visual-parity` `nestjs` `playwright-test`
`react` `tanstack-route` `typescript`

## 6. Guardrails

1. 생성물을 고친 뒤 끝내지 않는다. 항상 `rules/*.md` 부터 고친다.
2. generic TypeScript 규칙은 `typescript` companion 으로 올린다. framework skill 에는 overlay 만 둔다.
3. progressive 진입점은 router 와 index 다. full handbook 은 명시적 요청일 때만 읽는다.
4. `reviewWith` 는 자동 적용이 아니다. 역방향으로 추론하지 않는다.
5. skill 마다 구조가 다를 수 있으므로 수정 전에 실제 디렉터리를 확인한다.
6. `reference/agent-skills-main` 문장을 그대로 옮기지 않는다. 이 레포 구조에 맞게 다시 쓴다.
7. 루트 문서를 갱신할 때 현재 지원 skill 목록을 실제 상태 기준으로 적는다.
