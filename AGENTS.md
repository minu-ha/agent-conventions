# AGENTS.md

이 저장소에서 작업하는 AI coding agent 규칙.

다른 프로젝트용 시작 템플릿은 [AGENTS.template.md](./AGENTS.template.md).
그 문서는 이 저장소와 무관하게 독립적으로 동작한다.

핵심 제약은 하나다. **사람이 고치는 곳은 `rules/*.md` 뿐**이고 나머지는 build 가 만든다.

| 단계 | 대상 | 성격 |
| --- | --- | --- |
| 입력 | `rules/*.md` | 정본 |
| build | `HANDBOOK.md` · `RULES_INDEX.md` · `contracts/*.md` | 생성물. 직접 편집 시 소실 |
| 로드 | `SKILL.md` 가 경로 결정 | progressive 는 index 부터, 전체 로드는 handbook 통째로 |

---

## 목차

1. [원칙](#1-원칙) — 판단 기준
2. [Skill Types](#2-skill-types) — 대상과 로딩 방식
3. [Structured Skill Artifact Contract](#3-structured-skill-artifact-contract) — 정본과 생성물
4. [Editing Rules](#4-editing-rules) — 수정 순서
    - 4.1 [routing 키](#41-routing-키)
5. [Commands](#5-commands) — 검증 명령
6. [Guardrails](#6-guardrails) — 금지 사항

사람용 문서는 [README.md](./README.md) 와 [CONTRIBUTING.md](./CONTRIBUTING.md).
build tooling 은 [package/](./package/README.md).
[reference/](./reference/agent-skills-main/README.md) 는 비교용. 정본 아님.

---

## 1. 원칙

1. **정본만 수정.** `rules/*.md` 를 고친다. 생성물을 고치고 끝내지 않는다.
2. **최소 변경.** 요청 범위 밖 리팩터링 금지. 인접 코드 개선 금지.
3. **검증 후 보고.** `validate` → `build` → `check:generated` 의 실제 출력으로 말한다.
4. **불확실하면 질문.** 추측으로 규칙 의미를 바꾸지 않는다.

---

## 2. Skill Types

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

progressive 는 `SKILL.md` → `RULES_INDEX.md` → 걸린 `contracts/*.md` 로 좁힌다.
전체 로드는 `SKILL.md` 가 지시하는 `HANDBOOK.md` 를 통째로 읽는다.

`metadata.json.companions` 가 `required` 와 `conditional` 활성화를 선언한다.
`extends` 는 아직 progressive 로 안 옮긴 skill 의 호환 계약.

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

사람이 직접 수정하는 정본은
`rules/_sections.md`, `rules/_template.md`, `rules/*.md`, `metadata.json`, `SKILL.md`,
progressive `routing-evals.json`.

`HANDBOOK.md`, progressive `RULES_INDEX.md`, progressive `contracts/*.md` 는 생성물.

---

## 4. Editing Rules

1. `SKILL.md`, `metadata.json`, `rules/_sections.md` 를 먼저 훑어 현재 구성 확인.
2. 규칙 변경은 `rules/_sections.md`, `rules/_template.md`, `rules/*.md`를 수정.
   활성화 흐름이 바뀌면 `SKILL.md`, 라우팅 조건이 바뀌면 rule frontmatter 와
   `routing-evals.json` 도 함께.
3. 공통 규칙은 companion skill 로. framework · project 예외만 local overlay 로.
4. `metadata.json.companions` 의 mode 가 현재 활성화 계약과 맞는지 확인.
5. 생성물은 직접 편집 금지.
6. `validate` → `build` → `check:generated` 순서로 검증.
7. skill 인벤토리나 artifact 역할이 바뀌면 [README.md](./README.md),
   [CONTRIBUTING.md](./CONTRIBUTING.md), [package/README.md](./package/README.md) 도 갱신.

새 skill 은 이미 정리된 `react`, `typescript`, `css` 를 템플릿으로 삼는다.

### 4.1 routing 키

| 키 | 동작 |
| --- | --- |
| `appliesWhen` | 이 규칙이 걸리는 조건. 한 줄, 160자 이내 |
| `requiresSelected` | 함께 적용하는 필수 관계. cross-skill 이면 companion 도 활성화 |
| `reviewWith` | 재평가 힌트. 자동 적용 아님. 방향 있음 — 역방향 추론 금지 |
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

buildable skill: `astro` `css` `figma-visual-parity` `nestjs` `playwright-test`
`react` `tanstack-route` `typescript`

---

## 6. Guardrails

1. 생성물을 고치고 끝내지 않는다. 항상 `rules/*.md` 부터.
2. generic TypeScript 규칙은 `typescript` companion 으로. framework skill 에는 overlay 만.
3. progressive 진입점은 router 와 index. full handbook 은 명시적 요청일 때만.
4. `reviewWith` 는 자동 적용 아님. 역방향 추론 금지.
5. skill 마다 구조가 다르다. 수정 전 실제 디렉터리 확인.
6. `reference/agent-skills-main` 문장을 그대로 옮기지 않는다. 이 저장소 구조에 맞게 다시 쓴다.
7. 루트 문서 갱신 시 현재 지원 skill 목록을 실제 상태로 기록한다.
