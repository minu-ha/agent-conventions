# agent-conventions

팀 코딩 컨벤션을 AI coding agent skill 형태로 관리하는 공용 저장소입니다.
규칙 정본은 이 레포의 `skill/`에 한 번만 두고, 프로젝트에는 복사하지 않습니다.
각 프로젝트는 자기 `AGENTS.md`에서 skill 이름만 참조합니다.

> ### 처음이라면 → **[ONBOARDING.md](./ONBOARDING.md)**
> 컨벤션을 지키며 코딩하는 법을 30분 안에 잡아 줍니다. 대부분 이것만 보면 됩니다.

## 어디로 가야 하나

| 하려는 것 | 목적지 |
| --- | --- |
| **처음 왔다** | **[ONBOARDING.md](./ONBOARDING.md)** — 설치부터 첫 작업까지 |
| 구조가 어떻게 굴러가는지 보고 싶다 | [overview.html](./overview.html) — 흐름도 3장 |
| 규칙 내용이 궁금하다 | `skill/<name>/AGENTS.md` — 목차가 있는 전체 핸드북 |
| 어떤 규칙이 있는지 목록만 | `skill/<name>/RULES_INDEX.md` (react · typescript · css) |
| 규칙을 고치고 싶다 | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| 프로젝트에 적용하고 싶다 | [설치](#설치) → [프로젝트에 붙이기](#프로젝트에-붙이기) |
| 빌드·검증 도구를 알고 싶다 | [package/README.md](./package/README.md) |
| 왜 이런 구조가 됐는지 | [docs/progressive-loading.html](./docs/progressive-loading.html) |
| 이 레포에서 에이전트로 작업한다 | [AGENTS.md](./AGENTS.md) — agent용 작업 규칙 |

`overview.html`과 `docs/progressive-loading.html`은 브라우저로 바로 열거나
WebStorm HTML 프리뷰로 보면 됩니다. 외부 의존성 없는 단일 파일입니다.

## 포함된 Skill

| Skill | 이름 | Loading | 규칙 범위 |
| --- | --- | --- | --- |
| [react](./skill/react/AGENTS.md) | `convention-react` | progressive | 컴포넌트 경계, route-local 분리, handler 흐름, state 오리진, 문서화 |
| [typescript](./skill/typescript/AGENTS.md) | `convention-typescript` | progressive | import, custom type, helper 분리, fallback 처리, JSDoc |
| [css](./skill/css/AGENTS.md) | `convention-css` | progressive | plain CSS 기본값, `rt_/wg_/ui_/loc_` owner namespace, selector 깊이, 디자인 토큰 |
| [astro](./skill/astro/AGENTS.md) | `convention-astro` | 전체 로드 | `src/pages` route-local ownership, `rt_*` surface 네이밍, rendering mode, island, content collections |
| [tanstack-route](./skill/tanstack-route/AGENTS.md) | `convention-tanstack-route` | 전체 로드 | file-based route, layout shell, redirect, search param, route-local helper |
| [playwright-test](./skill/playwright-test/AGENTS.md) | `convention-playwright-test` | 전체 로드 | integration/e2e 경계, locator, waiting, mocking, 데이터 고립 |
| [nestjs](./skill/nestjs/AGENTS.md) | `convention-nestjs` | 전체 로드 | module, controller, service, DTO, Prisma, 테스트 경계 |
| [figma-visual-parity](./skill/figma-visual-parity/AGENTS.md) | `figma-visual-parity` | 전체 로드 | Figma 링크·node·screenshot 기준 visual parity workflow |

**companion은 자동으로 켜집니다.** `metadata.json`이 선언하고 에이전트가 판정하므로
프로젝트 `AGENTS.md`에는 owner skill만 적어도 됩니다.
`react`는 `typescript`를 항상, `css`를 styling surface 조건부로 켭니다.

TypeScript 기반 framework 프로젝트에서는 framework skill 하나만 적기보다
`convention-astro` + `convention-typescript` + `convention-css` 또는
`convention-react` + `convention-typescript`처럼 함께 적는 구성을 권장합니다.

`superpowers` 같은 workflow companion pack은 선택입니다. 이 저장소의 convention skill은
그것 없이도 동작하지만, 프로젝트 `AGENTS.md`가 `subagent-driven-development` 같은
이름을 직접 참조한다면 그 pack 설치를 전제로 적어 두는 편이 안전합니다.

## 설치

에이전트가 시작 시 `~/.agents/skills/`를 스캔한다면 symlink 연결이 가장 단순합니다.

```bash
mkdir -p ~/.agents/skills
ln -s /absolute/path/to/agent-conventions/skill ~/.agents/skills/conventions
```

이미 있으면 백업한 뒤 교체하고, 에이전트를 재시작합니다.

```bash
mv ~/.agents/skills/conventions ~/.agents/skills/conventions.backup
ln -s /absolute/path/to/agent-conventions/skill ~/.agents/skills/conventions
```

## 프로젝트에 붙이기

전체 규칙을 프로젝트로 복사하지 않습니다. 아래 중 하나를 프로젝트 `AGENTS.md`에 붙이고,
그 아래에 프로젝트 고유 제약만 덧붙입니다.

| 복사할 파일 | 언제 |
| --- | --- |
| [AGENTS.frontend-conventions.md](./AGENTS.frontend-conventions.md) | React + TypeScript + CSS 프로젝트 기본값 |
| [AGENTS.superpowers.md](./AGENTS.superpowers.md) | workflow만 쓰고 코드 규칙은 프로젝트가 관리할 때 |
| [AGENTS.superpowers.conventions.md](./AGENTS.superpowers.conventions.md) | workflow와 convention 정책을 함께 강하게 운영할 때 |

역할은 이렇게 나눕니다.

- **이 레포의 skill** — 공통 스타일, 경계, 문서화 규칙
- **프로젝트 `AGENTS.md`** — 생성 파일 보호, 검증·배포 명령, 서브에이전트 사용 조건
- **project-local overlay** — 프로젝트 고유 디렉터리, owner, API, 예외

어떤 변경에 무엇이 켜지는지는 [AGENTS.frontend-conventions.md](./AGENTS.frontend-conventions.md)의
`Activation` 절이 정본입니다. 요약하면 TSX는 `react` + `typescript`, 여기에 `className`이나
stylesheet가 걸리면 `css`가 추가되고, 순수 CSS는 TypeScript를 켜지 않습니다.

## 규칙 고치기

`rules/*.md`가 정본이고 `AGENTS.md` · `RULES_INDEX.md` · `contracts/*.md`는 생성물입니다.
생성물을 직접 고치면 다음 build에서 덮어써지고 `check:generated`에서 실패합니다.

편집 절차, frontmatter 레퍼런스, 어느 skill에 둘지 판단하는 기준은
[CONTRIBUTING.md](./CONTRIBUTING.md)에 있습니다.

## 명령

```bash
npm --prefix package install                  # 처음 한 번

npm --prefix package run dev:react            # 한 skill validate + build
npm --prefix package run validate -- --all
npm --prefix package run build -- --all
npm --prefix package run check:generated:all
npm --prefix package run check:handbooks:all
npm --prefix package run test
```

더 자세한 script 설명은 [package/README.md](./package/README.md)에 있습니다.

## 버전 관리

- 각 skill `SKILL.md`의 `name` 변경은 breaking change입니다.
- 새 skill 추가나 호환되는 규칙 확장은 minor입니다.
- 문구 수정, 예시 보강, 비호환성 없는 보정은 patch입니다.

[reference/agent-skills-main/](./reference/agent-skills-main/README.md)은 skill pack 구조를
비교할 때 참고하는 외부 레퍼런스이며, source of truth는 항상 현재 `skill/`과 `package/`입니다.
