# AGENTS.md

이 저장소에서 작업하는 AI coding agent 를 위한 규칙입니다.
다른 프로젝트에 배포할 시작 템플릿은 [AGENTS.template.md](./AGENTS.template.md) 이며,
그 문서는 이 저장소와 무관하게 독립적으로 동작합니다.

이 저장소의 핵심 제약은 하나입니다. 사람이 고치는 곳은 `rules/*.md` 뿐이고,
나머지 세 가지는 build 가 매번 다시 만듭니다.

```text
rules/*.md                                             정본
  ↓  build
HANDBOOK.md · RULES_INDEX.md · contracts/*.md          생성물
  ↓  SKILL.md 가 경로를 결정
progressive   RULES_INDEX → 걸린 contracts → 필요 시 rules
전체 로드      HANDBOOK.md 통째로
```

---

## 목차

1. [원칙](#1-원칙) — 판단 기준
2. [Skill Types](#2-skill-types) — 대상 skill 과 로딩 방식
3. [Structured Skill Artifact Contract](#3-structured-skill-artifact-contract) — 정본과 생성물
4. [Editing Rules](#4-editing-rules) — 수정 순서
    - 4.1 [routing 키의 의미](#41-routing-키의-의미)
5. [Commands](#5-commands) — 검증 명령
6. [Guardrails](#6-guardrails) — 금지 사항

사람이 읽는 문서는 [README.md](./README.md) 와 [CONTRIBUTING.md](./CONTRIBUTING.md) 입니다.
build tooling 은 [package/](./package/README.md) 에 있고,
[reference/](./reference/agent-skills-main/README.md) 는 비교용이며 정본이 아닙니다.

---

## 1. 원칙

1. **정본만 수정** — `rules/*.md` 를 고칩니다. 생성물을 고친 뒤 종료하지 않습니다.
2. **최소 변경** — 요청 범위 밖 리팩터링과 인접 코드 개선을 하지 않습니다.
3. **검증 후 보고** — `validate` → `build` → `check:generated` 의 실제 출력으로 보고합니다.
4. **불확실하면 질문** — 추측으로 규칙의 의미를 바꾸지 않습니다.

---

## 2. Skill Types

모든 skill 이 structured skill 입니다.

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

progressive skill 은 `SKILL.md` → `RULES_INDEX.md` → 걸린 `contracts/*.md` 순으로 좁혀 갑니다.
전체 로드 skill 은 `SKILL.md` 가 지시하는 `HANDBOOK.md` 를 통째로 읽습니다.

`metadata.json.companions` 가 `required` 와 `conditional` 활성화를 선언하며,
`extends` 는 아직 progressive 로 이관하지 않은 skill 의 호환 계약입니다.

---

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

정리하면 사람이 직접 수정하는 정본은
`rules/_sections.md`, `rules/_template.md`, `rules/*.md`, `metadata.json`, `SKILL.md`,
progressive `routing-evals.json` 입니다.
`HANDBOOK.md`, progressive `RULES_INDEX.md`, progressive `contracts/*.md` 는 생성물입니다.

---

## 4. Editing Rules

1. `SKILL.md`, `metadata.json`, `rules/_sections.md` 를 먼저 훑어 현재 구성을 확인합니다.
2. 규칙 변경은 `rules/_sections.md`, `rules/_template.md`, `rules/*.md`를 수정합니다.
   활성화 흐름이 바뀌면 `SKILL.md` 를, 라우팅 조건이 바뀌면 rule frontmatter 와
   `routing-evals.json` 을 함께 수정합니다.
3. 공통 규칙은 companion skill 에 두고 framework 나 project 예외만 local overlay 로 남깁니다.
4. `metadata.json.companions` 의 mode 가 현재 활성화 계약과 일치하는지 확인합니다.
5. 생성물(`HANDBOOK.md`, `RULES_INDEX.md`, `contracts/*.md`)은 직접 편집하지 않습니다.
6. `validate` → `build` → `check:generated` 순서로 검증합니다.
7. skill 인벤토리나 artifact 역할이 바뀌면 [README.md](./README.md),
   [CONTRIBUTING.md](./CONTRIBUTING.md), [package/README.md](./package/README.md) 도 갱신합니다.

새 skill 을 추가할 때는 이미 정리된 `react`, `typescript`, `css` 를 템플릿으로 삼습니다.

### 4.1 routing 키의 의미

| 키 | 동작 |
| --- | --- |
| `appliesWhen` | 이 규칙이 걸리는 조건. 한 줄, 160자 이내 |
| `requiresSelected` | 함께 적용하는 필수 관계. cross-skill 이면 companion 도 활성화 |
| `reviewWith` | 재평가 힌트. 자동 적용 아님. 방향이 있으므로 역방향 추론 금지 |
| `requiredOnCompletion` | 마무리 시 항상 적용 |

---

## 5. Commands

```bash
npm --prefix package install                       # 최초 1회
npm --prefix package run dev:<skill>               # validate + build
npm --prefix package run validate -- --all
npm --prefix package run build -- --all
npm --prefix package run check:generated:all
npm --prefix package run check:handbooks:all
npm --prefix package run test
```

buildable skill 은 `astro` `css` `figma-visual-parity` `nestjs` `playwright-test`
`react` `tanstack-route` `typescript` 입니다.

---

## 6. Guardrails

1. 생성물을 고친 뒤 종료하지 않습니다. 항상 `rules/*.md` 부터 수정합니다.
2. generic TypeScript 규칙은 `typescript` companion 으로 올리고 framework skill 에는 overlay 만 둡니다.
3. progressive 진입점은 router 와 index 입니다. full handbook 은 명시적 요청일 때만 읽습니다.
4. `reviewWith` 는 자동 적용이 아니며 역방향으로 추론하지 않습니다.
5. skill 마다 구조가 다를 수 있으므로 수정 전에 실제 디렉터리를 확인합니다.
6. `reference/agent-skills-main` 의 문장을 그대로 옮기지 않고 이 저장소 구조에 맞게 다시 씁니다.
7. 루트 문서를 갱신할 때 현재 지원 skill 목록을 실제 상태 기준으로 기록합니다.
