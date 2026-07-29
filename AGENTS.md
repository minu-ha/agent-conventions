# AGENTS.md

> 이 저장소에서 작업하는 AI coding agent 용 규칙. 다른 프로젝트로 복사할 것은
> [AGENTS.template.md](./AGENTS.template.md).

## 목차

- [원칙](#원칙) — 무엇을 고치고 무엇을 건드리지 않는가
- [Skill Types](#skill-types) — 대상 skill 목록
- [Structured Skill Artifact Contract](#structured-skill-artifact-contract) — 정본과 생성물
- [Editing Rules](#editing-rules) — 수정 순서
- [Commands](#commands) — 검증 명령
- [Guardrails](#guardrails) — 하지 말 것

사람용 문서는 [ONBOARDING.md](./ONBOARDING.md)(시작하기)와
[CONTRIBUTING.md](./CONTRIBUTING.md)(규칙 고치기).
build tooling 은 [package/](./package/README.md).
[reference/](./reference/agent-skills-main/README.md) 는 비교용이며 정본 아님.

## 원칙

- **정본만 고침** — `rules/*.md`. 생성물을 고치고 끝내지 않음
- **최소 변경** — 요청 범위 밖 리팩터링 금지. 인접 코드 "개선" 금지
- **검증 후 보고** — `validate` → `build` → `check:generated` 실행 결과로 말함
- **모르면 물음** — 추측으로 규칙 의미를 바꾸지 않음

## Skill Types

모든 skill 이 structured skill.

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

- **progressive** — `SKILL.md` → `RULES_INDEX.md` → 걸리는 `contracts/*.md`
- **전체 로드** — `SKILL.md` 가 지시하는 `HANDBOOK.md` 통째로
- `metadata.json.companions` 가 `required` / `conditional` 활성화를 선언.
  `extends` 는 아직 progressive 로 옮기지 않은 skill 의 호환 계약

## Structured Skill Artifact Contract

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
progressive `routing-evals.json`.
`HANDBOOK.md`, progressive `RULES_INDEX.md`, progressive `contracts/*.md` 는 생성물.

## Editing Rules

1. `SKILL.md`, `metadata.json`, `rules/_sections.md` 를 먼저 훑어 현재 구성 확인
2. 규칙 변경은 `rules/_sections.md`, `rules/_template.md`, `rules/*.md`를 수정.
   활성화 흐름이 바뀌면 `SKILL.md`, 라우팅 조건이 바뀌면 rule frontmatter 와
   `routing-evals.json` 도 함께
3. 공통 규칙은 companion skill 로, framework/project 예외만 local overlay 로
4. `metadata.json.companions` 의 mode 가 현재 활성화 계약과 맞는지 확인
5. 생성물(`HANDBOOK.md`, `RULES_INDEX.md`, `contracts/*.md`)은 직접 편집 금지
6. `validate` → `build` → `check:generated` 순서로 검증
7. skill 인벤토리나 artifact 역할이 바뀌면 [README.md](./README.md),
   [CONTRIBUTING.md](./CONTRIBUTING.md), [package/README.md](./package/README.md) 도 함께 갱신

새 skill 추가 시에는 이미 정리된 `react`, `typescript`, `css` 를 템플릿으로 삼을 것.

### routing 키의 의미

| 키 | 동작 |
| --- | --- |
| `appliesWhen` | 이 규칙이 걸리는 조건. 한 줄, 160자 이내 |
| `requiresSelected` | 함께 적용하는 필수 관계. cross-skill 이면 companion 도 활성화 |
| `reviewWith` | 재평가 힌트. 자동 적용 아님. **방향 있음 — 역방향 추론 금지** |
| `requiredOnCompletion` | 마무리 시 항상 적용 |

## Commands

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

## Guardrails

- 생성물을 고친 뒤 끝내지 않음. 항상 `rules/*.md` 부터
- generic TypeScript 규칙은 `typescript` companion 으로 올림. framework skill 에는 overlay 만
- progressive 진입점은 router 와 index. full handbook 은 명시적 요청일 때만
- `reviewWith` 는 자동 적용 아님. 역방향으로 추론하지 않음
- skill 마다 구조가 다를 수 있으므로 수정 전 실제 디렉터리 확인
- `reference/agent-skills-main` 문장을 그대로 옮기지 않음. 이 레포 구조에 맞게 재서술
- 루트 문서 갱신 시 현재 지원 skill 목록을 실제 상태 기준으로 기록
