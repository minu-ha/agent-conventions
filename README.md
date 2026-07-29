# agent-conventions

팀 코딩 컨벤션을 AI coding agent skill 로 관리하는 공용 저장소.
**사람이 보는 핸드북**이자 **에이전트가 따르는 가이드라인**.
규칙 정본은 `skill/` 한 곳이고, 프로젝트는 복사 없이 skill 이름만 참조한다.

```text
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│         사람이 읽는 것          │   │       에이전트가 읽는 것        │
├─────────────────────────────────┤   ├─────────────────────────────────┤
│ ONBOARDING.md    시작하기       │   │ AGENTS.md        이 레포 작업   │
│ CONTRIBUTING.md  규칙 고치기    │   │ SKILL.md         라우터         │
│ HANDBOOK.md      규칙 전문      │   │ RULES_INDEX.md   규칙 목록      │
│ overview.html    구조 흐름도    │   │ contracts/*.md   선택된 계약    │
└─────────────────────────────────┘   └─────────────────────────────────┘
```

| 절 | 내용 |
| --- | --- |
| [1. 어디로 가야 하나](#1-어디로-가야-하나) | 목적별 목적지 |
| [2. 포함된 Skill](#2-포함된-skill) | 8개 skill 과 담당 범위 |
| [3. 설치](#3-설치) | symlink 한 줄 |
| [4. 더 보기](#4-더-보기) | 문서 목록 |

## 1. 어디로 가야 하나

| 하려는 것 | 목적지 |
| --- | --- |
| **처음 왔다** | **[ONBOARDING.md](./ONBOARDING.md)** — 설치부터 첫 작업까지 30분 |
| 구조가 어떻게 굴러가는지 | [overview.html](./overview.html) — 흐름도 3장 |
| 규칙 내용 확인 | `skill/<name>/HANDBOOK.md` — 목차 있는 전체 핸드북 |
| 규칙 목록만 훑기 | `skill/<name>/RULES_INDEX.md` — react · typescript · css |
| 규칙 고치기 | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| 새 프로젝트에 AGENTS.md 만들기 | [AGENTS.template.md](./AGENTS.template.md) |
| 빌드·검증 도구 | [package/README.md](./package/README.md) |
| 왜 이런 구조인지 | [docs/progressive-loading.html](./docs/progressive-loading.html) |
| 이 레포에서 에이전트로 작업 | [AGENTS.md](./AGENTS.md) |

`.html` 두 개는 브라우저로 바로 열거나 WebStorm HTML 프리뷰로 확인한다. 외부 의존성 없음.

## 2. 포함된 Skill

| Skill | Loading | 범위 |
| --- | --- | --- |
| [react](./skill/react/HANDBOOK.md) | progressive | 컴포넌트 경계 · route-local · handler · state |
| [typescript](./skill/typescript/HANDBOOK.md) | progressive | import · type · helper · JSDoc |
| [css](./skill/css/HANDBOOK.md) | progressive | plain CSS · owner namespace · 토큰 |
| [astro](./skill/astro/HANDBOOK.md) | 전체 로드 | route ownership · rendering · island |
| [tanstack-route](./skill/tanstack-route/HANDBOOK.md) | 전체 로드 | route · layout · search param |
| [playwright-test](./skill/playwright-test/HANDBOOK.md) | 전체 로드 | e2e 경계 · locator · mocking |
| [nestjs](./skill/nestjs/HANDBOOK.md) | 전체 로드 | module · service · DTO · Prisma |
| [figma-visual-parity](./skill/figma-visual-parity/HANDBOOK.md) | 전체 로드 | Figma visual parity |

에이전트가 쓰는 skill 이름은 `convention-<skill>`. `figma-visual-parity` 만 그대로.

1. companion 은 `metadata.json` 선언에 따라 자동으로 켜진다. 프로젝트에는 owner skill 만 적으면 된다.
2. `react` 는 `typescript` 를 항상, `css` 를 styling surface 조건부로 켠다.
3. TypeScript 기반 framework 프로젝트는 framework skill 하나만 적기보다
   `convention-astro` + `convention-typescript` + `convention-css` 처럼 함께 지정한다.

## 3. 설치

```bash
mkdir -p ~/.agents/skills
ln -s /absolute/path/to/agent-conventions/skill ~/.agents/skills/conventions
```

기존 링크가 있으면 백업 후 교체하고 에이전트를 재시작한다.

```bash
mv ~/.agents/skills/conventions ~/.agents/skills/conventions.backup
ln -s /absolute/path/to/agent-conventions/skill ~/.agents/skills/conventions
```

## 4. 더 보기

| 문서 | 내용 |
| --- | --- |
| [ONBOARDING.md](./ONBOARDING.md) | 컨벤션을 지키며 코딩하는 법 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 규칙 추가·수정 절차 |
| [AGENTS.md](./AGENTS.md) | 이 레포 작업용 agent 규칙 |
| [AGENTS.template.md](./AGENTS.template.md) | 새 프로젝트용 AGENTS.md 시작 템플릿 |
| [package/README.md](./package/README.md) | build · validate · test tooling |

버전 관리 — `SKILL.md` 의 `name` 변경은 breaking, skill 추가·호환 확장은 minor,
문구 수정은 patch.

[reference/agent-skills-main/](./reference/agent-skills-main/README.md) 은 외부 레퍼런스이며
정본이 아니다.
