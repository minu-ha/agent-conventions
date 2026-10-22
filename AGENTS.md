# AGENTS.md

이 저장소에서 작업하는 AI coding agent 규칙.

다른 프로젝트용 시작 템플릿은 [AGENTS.template.md](./AGENTS.template.md).
그 문서는 이 저장소와 무관하게 독립적으로 동작한다.

핵심 제약은 하나다. **규칙은 `rules/*.md`에서 고치고 생성물은 build로 갱신한다.**
라우터 · 메타데이터 · 라우팅 오라클의 수정 범위는 3절에 정리했다.

| 단계 | 대상 | 성격 |
| --- | --- | --- |
| 입력 | `rules/*.md` | 정본 |
| build | `RULES_INDEX.md` · `contracts/*.md` | 생성물. 직접 편집 시 소실 |
| 로드 | `SKILL.md`가 경로 결정 | index부터 걸린 contract, 원문 순서 |

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
규칙 산문의 문체 · 낱말 · `appliesWhen` 형태는 [CONTRIBUTING.md](./CONTRIBUTING.md) 3절을 따른다. `validate` 가 막는다.
build tooling은 [content/public/tooling.md](./content/public/tooling.md).

---

## 1. 원칙

1. **정본만 수정.** `rules/*.md`를 고친다. 생성물을 고치고 끝내지 않는다.
2. **최소 변경.** 요청 범위 밖 리팩터링 금지. 인접 코드 개선 금지.
3. **검증 후 보고.** `validate` → `build` → `check`의 실제 출력으로 말한다.
4. **불확실하면 질문.** 추측으로 규칙 의미를 바꾸지 않는다.

---

## 2. Skill Types

모든 skill이 structured skill.

- [skill/react](./skill/react/SKILL.md)
- [skill/typescript](./skill/typescript/SKILL.md)
- [skill/css](./skill/css/SKILL.md)
- [skill/figma](./skill/figma/SKILL.md)

모든 skill은 `SKILL.md` → `RULES_INDEX.md` → 걸린 `contracts/*.md`로 좁힌다.

`metadata.json.companions`가 `required`와 `conditional` 활성화를 선언한다.
계층은 이 선언이 정한다. 나를 companion으로 켜는 skill이 위 계층이고,
`typescript`는 아무 skill도 켜지 않으므로 가장 아래다. `figma`는 `react`, `css`를 켜는 가장 위다.
아래에서 위를 가리키지 않는다.

---

## 3. Structured Skill Artifact Contract

| Artifact | Role |
| --- | --- |
| `rules/_sections.md`, `rules/_template.md`, `rules/*.md`, `examples/<rule-id>/*` | Editable rule source of truth. 규칙은 `<<<` 줄로 예제 파일을 불러온다. |
| `metadata.json` | Editable build and companion activation contract. |
| `SKILL.md` | Editable activation/load router. |
| `RULES_INDEX.md` | Generated compact index. |
| `contracts/*.md` | Generated selected-rule contract; never edit directly. |
| `routing-evals.json` | Editable test oracle; never runtime context. |

사람이 직접 수정하는 정본은
`rules/_sections.md`, `rules/_template.md`, `rules/*.md`, `examples/<rule-id>/*`, `metadata.json`, `SKILL.md`,
`routing-evals.json`.

`RULES_INDEX.md`, `contracts/*.md`는 생성물. 사람용 전체 보기는 `content/` 사이트다.

---

## 4. Editing Rules

1. `SKILL.md`, `metadata.json`, `rules/_sections.md`를 먼저 훑어 현재 구성 확인.
2. 규칙 변경은 `rules/_sections.md`, `rules/_template.md`, `rules/*.md`, `examples/<rule-id>/*`를 수정.
   활성화 흐름이 바뀌면 `SKILL.md`, 라우팅 조건이 바뀌면 rule frontmatter와
   `routing-evals.json`도 함께.
3. 공통 규칙은 companion skill로. framework · project 예외만 local overlay로.
4. `metadata.json.companions`의 mode가 현재 활성화 계약과 맞는지 확인.
5. 생성물은 직접 편집 금지.
6. `validate` → `build` → `check` 순서로 검증.
7. skill 인벤토리나 artifact 역할이 바뀌면 [README.md](./README.md),
   [CONTRIBUTING.md](./CONTRIBUTING.md), [content/public/tooling.md](./content/public/tooling.md) 도 갱신.

새 skill은 이미 정리된 `react`, `typescript`, `css`, `figma`를 템플릿으로 삼는다.

### 4.1 routing 키

| 키 | 동작 |
| --- | --- |
| `appliesWhen` | 이 규칙이 걸리는 조건. 불릿 목록 또는 한 줄로 작성하며, 합쳐진 라우팅 문장은 160자 이내 |
| `requiresSelected` | 함께 적용하는 필수 관계. cross-skill 이면 companion도 활성화 |
| `reviewWith` | 재평가 힌트. 자동 적용 아님. 방향 있음 — 역방향 추론 금지 |
| `requiredOnCompletion` | 마무리 시 항상 적용. 인덱스에는 `completionGate`로 찍히고 `SKILL.md` 3절이 그 이름으로 안내한다. 지금은 `figma`의 `verify` 규칙 둘만 쓴다 |

---

## 5. Commands

```bash
npm install            # 최초 1회
npm run validate       # 정본 검사. 한 skill 만: -- --skill=react
npm run build          # RULES_INDEX, contracts, content/public/convention/ 생성
npm run check          # validate, 생성물 신선도, 흐름도 폭, typecheck, lint, test
npm run dev              # build 후 사이트 dev 서버. 주소는 터미널에 찍힌다
npm run content:build    # 배포용. content/dist 에 정적 HTML
npm run content:preview  # content/dist 의 공개 사이트 미리보기
```

`content/`는 for-humanity가 읽는 사람용 문서 루트다. 공개 문서는 `content/public/`, 설정은 루트 `for-humanity.config.ts`에 둔다.
홈의 정본은 루트 `README.md`다. `npm run sync:readme`가 사이트용 링크를 변환해 `content/README.md`를 생성한다.
`dev`와 `content:build`에서도 자동 실행하므로 홈은 직접 편집하지 않는다.
`content/public/convention/`과 정적 출력 `content/dist/`는 생성 폴더라 커밋하지 않는다.

buildable skill: `css` `figma` `react` `typescript`

---

## 6. Guardrails

1. 생성물을 고치고 끝내지 않는다. 항상 `rules/*.md`부터.
2. generic TypeScript 규칙은 `typescript` companion으로 보낸다. framework skill에는 overlay만 둔다.
3. 진입점은 router와 인덱스다. 전체 검토는 명시적 요청일 때만 `rules/*.md`를 차례로 읽는다.
4. `reviewWith`는 자동으로 적용하지 않는다. 역방향으로 추론하지 않는다.
5. 수정 전에 실제 디렉터리를 확인한다. 문서에 적힌 구조를 기억으로 대신하지 않는다.
6. 외부 레퍼런스 문장을 그대로 옮기지 않는다. 이 저장소 구조에 맞게 다시 쓴다.
7. 루트 문서 갱신 시 현재 지원 skill 목록을 실제 상태로 기록한다.
