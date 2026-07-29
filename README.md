# agent-conventions

팀 코딩 컨벤션을 AI coding agent skill 로 관리하는 공용 저장소.
규칙 정본은 `skill/` 한 곳에만 두고, 각 프로젝트는 복사 없이 skill 이름만 참조합니다.
사람은 생성된 핸드북으로 읽고, 에이전트는 라우터를 거쳐 지금 필요한 규칙만 골라 읽습니다.

---

## 목차

1. [빠른 시작](#1-빠른-시작) — 설치부터 첫 작업까지 약 30분
    - 1.1 [설치](#11-설치)
    - 1.2 [프로젝트 연결](#12-프로젝트-연결)
    - 1.3 [담당 영역 핸드북](#13-담당-영역-핸드북)
    - 1.4 [동작 확인](#14-동작-확인)
2. [문서 구성](#2-문서-구성) — 문서별 역할과 독자
3. [포함된 Skill](#3-포함된-skill) — 8개 skill 과 담당 범위
4. [동작 원리](#4-동작-원리) — 규칙이 선택되는 경로
5. [문제 해결](#5-문제-해결) — 증상별 원인
6. [규칙 수정](#6-규칙-수정) — 기여자 문서로 연결

---

## 1. 빠른 시작

컨벤션을 **적용**하려는 경우 이 절만 보면 충분합니다.
규칙 자체를 고치려면 [CONTRIBUTING.md](./CONTRIBUTING.md) 로 이동하십시오.

### 1.1 설치

에이전트가 시작 시 `~/.agents/skills/` 를 스캔하는 환경이라면 symlink 하나로 충분합니다.

```bash
mkdir -p ~/.agents/skills
ln -s /absolute/path/to/agent-conventions/skill ~/.agents/skills/conventions
```

기존 링크가 있으면 백업 후 교체하고 에이전트를 재시작하십시오.

```bash
mv ~/.agents/skills/conventions ~/.agents/skills/conventions.backup
ln -s /absolute/path/to/agent-conventions/skill ~/.agents/skills/conventions
```

### 1.2 프로젝트 연결

프로젝트 `AGENTS.md` 의 컨벤션 항목에 사용할 skill 이름을 명시합니다.
규칙 본문은 복사하지 않습니다.

| 상황 | 조치 |
| --- | --- |
| `AGENTS.md` 가 없는 새 프로젝트 | [AGENTS.template.md](./AGENTS.template.md) 를 복사해 시작 |
| 이미 `AGENTS.md` 가 있는 프로젝트 | 컨벤션 항목에 skill 이름만 추가 |

TypeScript 기반 프레임워크 프로젝트라면 framework skill 하나만 적기보다
`convention-astro` + `convention-typescript` + `convention-css` 처럼
companion 까지 함께 명시하는 편이 안전합니다.

### 1.3 담당 영역 핸드북

전체 규칙을 외울 필요는 없습니다. 담당 영역의 핸드북만 한 번 훑어두면
리뷰 단계에서 되돌아오는 일이 줄어듭니다.

| 작업 영역 | 핸드북 |
| --- | --- |
| React 화면 · 컴포넌트 | [react](./skill/react/HANDBOOK.md) + [typescript](./skill/typescript/HANDBOOK.md) |
| 스타일시트 · `className` | 위 두 개 + [css](./skill/css/HANDBOOK.md) |
| Astro 페이지 | [astro](./skill/astro/HANDBOOK.md) |
| TanStack Router 라우트 | [tanstack-route](./skill/tanstack-route/HANDBOOK.md) |
| NestJS 백엔드 | [nestjs](./skill/nestjs/HANDBOOK.md) |
| Playwright 테스트 | [playwright-test](./skill/playwright-test/HANDBOOK.md) |
| Figma 기준 UI 구현 | [figma-visual-parity](./skill/figma-visual-parity/HANDBOOK.md) |

각 핸드북은 번호 목차와 Impact 등급을 갖추고 있으므로 `CRITICAL` 섹션부터 보십시오.
규칙마다 Incorrect / Correct 예시가 붙어 있습니다.
특정 규칙만 다시 찾을 때는 규칙당 한 줄인 `RULES_INDEX.md` 쪽이 빠릅니다.

### 1.4 동작 확인

TSX 파일 하나를 고쳐 달라고 요청해 보십시오. 에이전트는 아래 순서로 움직입니다.

| 순서 | 동작 |
| --- | --- |
| 1 | 변경 판정 |
| 2 | `convention-react` + `convention-typescript` 활성화 |
| 3 | `RULES_INDEX` 를 끝까지 훑어 걸리는 규칙 선별 |
| 4 | 해당 `contracts` 를 읽고 구현 |
| 5 | 마무리로 diff 를 다시 훑어 위반 보고 |

`className` 이나 stylesheet 를 함께 건드리면 `convention-css` 가 추가로 켜지고,
순수 CSS 만 고치면 TypeScript 는 켜지지 않습니다.

---

## 2. 문서 구성

| 문서 | 독자 | 내용 |
| --- | --- | --- |
| README.md | 사람 | 이 문서. 설치와 적용 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 사람 | 규칙 추가·수정 절차 |
| `skill/<name>/HANDBOOK.md` | 사람 | 규칙 전문. 번호 목차와 예시 포함 |
| [overview.html](./overview.html) | 사람 | 실행 흐름 · 스킬 관계 · 규칙 관계 흐름도 |
| [docs/progressive-loading.html](./docs/progressive-loading.html) | 사람 | 설계 배경 · 토큰 측정 · 검증 · 한계 |
| [AGENTS.md](./AGENTS.md) | 에이전트 | 이 저장소에서 작업할 때의 규칙 |
| [AGENTS.template.md](./AGENTS.template.md) | 에이전트 | 다른 프로젝트용 시작 템플릿 |
| `skill/<name>/SKILL.md` | 에이전트 | 활성화 라우터 |
| `skill/<name>/RULES_INDEX.md` | 에이전트 | 규칙 목록. progressive skill 전용 |
| `skill/<name>/contracts/*.md` | 에이전트 | 선택된 규칙의 계약. progressive skill 전용 |
| [package/README.md](./package/README.md) | 사람 | build · validate · test tooling |

`.html` 두 개는 브라우저에서 바로 열거나 WebStorm HTML 프리뷰로 확인합니다.
외부 의존성이 없는 단일 파일입니다.

---

## 3. 포함된 Skill

| Skill | Loading | 담당 범위 |
| --- | --- | --- |
| [react](./skill/react/HANDBOOK.md) | progressive | 컴포넌트 경계 · route-local · handler · state |
| [typescript](./skill/typescript/HANDBOOK.md) | progressive | import · type · helper · JSDoc |
| [css](./skill/css/HANDBOOK.md) | progressive | plain CSS · owner namespace · 토큰 |
| [astro](./skill/astro/HANDBOOK.md) | 전체 로드 | route ownership · rendering · island |
| [tanstack-route](./skill/tanstack-route/HANDBOOK.md) | 전체 로드 | route · layout · search param |
| [playwright-test](./skill/playwright-test/HANDBOOK.md) | 전체 로드 | e2e 경계 · locator · mocking |
| [nestjs](./skill/nestjs/HANDBOOK.md) | 전체 로드 | module · service · DTO · Prisma |
| [figma-visual-parity](./skill/figma-visual-parity/HANDBOOK.md) | 전체 로드 | Figma 기준 visual parity |

에이전트가 사용하는 skill 이름은 `convention-<skill>` 형식이며
`figma-visual-parity` 만 예외입니다.

companion 은 `metadata.json` 선언에 따라 자동으로 활성화되므로
프로젝트에는 owner skill 만 명시하면 충분합니다.
`react` 는 `typescript` 를 항상 켜고, `css` 는 styling surface 가 바뀔 때만 켭니다.

---

## 4. 동작 원리

`progressive` 로 표시된 세 skill 은 규칙 전체를 로드하지 않고 단계적으로 좁혀 갑니다.

| 순서 | 파일 | 읽는 범위 | 빈도 |
| --- | --- | --- | --- |
| 1 | `SKILL.md` | 라우터. 무엇이 바뀌었는지 판정 | 항상 |
| 2 | `RULES_INDEX.md` | 규칙당 한 줄. 끝까지 훑어 후보 선별 | 항상 |
| 3 | `contracts/<id>.md` | 걸린 규칙의 규범만. 예시는 제외 | 걸린 규칙만 |
| 4 | `rules/<id>.md` | 원문 | `CRITICAL` 이거나 판단이 모호할 때 |

`HANDBOOK.md` 는 이 경로 밖에 있는 전체 핸드북입니다.
사람이 통독할 때 쓰고, 에이전트는 명시적 요청이 있을 때만 읽습니다.
전체 로드 skill 다섯 개는 `SKILL.md` 지시에 따라 `HANDBOOK.md` 를 통째로 읽습니다.

측정 결과와 설계 근거는 [docs/progressive-loading.html](./docs/progressive-loading.html)
에 정리돼 있습니다.

---

## 5. 문제 해결

| 증상 | 원인 |
| --- | --- |
| 에이전트가 컨벤션을 인식하지 못함 | symlink 미설치 또는 에이전트 재시작 누락 |
| 불필요한 규칙까지 적용 | 알려진 약점. 필요 규칙 누락보다는 안전한 실패 |
| `HANDBOOK.md` 수정이 되돌아옴 | 생성물. `rules/*.md` 를 수정해야 함 |
| 특정 규칙이 걸린 이유가 불분명 | 해당 규칙 frontmatter 의 `appliesWhen` 확인 |

---

## 6. 규칙 수정

규칙 추가·수정 절차는 [CONTRIBUTING.md](./CONTRIBUTING.md) 에 있습니다.
착수 전 알아둘 사항은 네 가지입니다.

| 항목 | 내용 |
| --- | --- |
| 정본 | `rules/*.md`. `HANDBOOK.md` · `RULES_INDEX.md` · `contracts/*.md` 는 생성물 |
| 본문 구조 | 규범을 첫 `Incorrect` 앞에서 마무리. 생성기가 그 앞부분만 계약으로 추출 |
| `appliesWhen` | 라우팅을 결정하는 한 줄. 규칙의 결론이 아니라 관찰 가능한 변경 조건 |
| 재생성 | `npm --prefix package run dev:<skill>` 후 `check:generated` |

이 저장소에서 AI 에이전트로 작업하는 경우 [AGENTS.md](./AGENTS.md) 가 작업 규칙입니다.

버전 관리 정책은 `SKILL.md` 의 `name` 변경이 breaking, skill 추가와 호환 확장이 minor,
문구 수정이 patch 입니다.

[reference/agent-skills-main/](./reference/agent-skills-main/README.md) 은
외부 skill pack 비교용 레퍼런스이며 정본이 아닙니다.
