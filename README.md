# agent-conventions

팀 코딩 컨벤션을 AI coding agent skill 형태로 관리하는 공용 저장소입니다.
이 레포는 실제로 배포되는 `skill/`과 structured skill을 검증하고 compile하는 [package](./package/README.md)를 함께 포함합니다.

프로젝트의 [AGENTS.md](./AGENTS.md)에서 이 저장소의 skill 이름을 참조하면, 팀 단위로 같은 규칙을 재사용할 수 있습니다.

## 이 레포에 있는 것

- `skill/`: 에이전트가 실제로 읽는 skill pack
- [package](./package/README.md): structured skill build, validate, test tooling
- [reference](./reference/agent-skills-main/README.md): 외부 skill pack 비교용 레퍼런스

## 포함된 Skill

현재 포함된 skill은 아래와 같습니다.

- [astro](./skill/astro/README.md) - `convention-astro`
  Astro thin page adapter, feature-based route implementation, rendering mode, island hydration, content collections, Actions/endpoints/server islands 규칙
- [react](./skill/react/README.md) - `convention-react`
  React 컴포넌트 경계, route-local 분리, handler 흐름, state 오리진, 문서화 규칙
- [css](./skill/css/README.md) - `convention-css`
  plain CSS 기본값, 전역 고유 클래스 네이밍, selector 깊이, wrapper 기준 스타일링, 디자인 토큰 규칙
- [tanstack-route](./skill/tanstack-route/README.md) - `convention-tanstack-route`
  TanStack Router file-based route, layout shell, redirect, search param, route-local helper 규칙
- [playwright-test](./skill/playwright-test/README.md) - `convention-playwright-test`
  Playwright integration/e2e 경계, locator 선택, waiting, mocking, 데이터 고립 규칙
- [typescript](./skill/typescript/README.md) - `convention-typescript`
  TypeScript import, custom type, helper 분리, fallback 처리, JSDoc 규칙
- [nestjs](./skill/nestjs/README.md) - `convention-nestjs`
  NestJS module, controller, service, DTO, Prisma, 테스트 경계 규칙
- [java](./skill/java/SKILL.md) - `convention-springboot`
  Spring Boot 기반 백엔드 컨벤션

## Structured Skill과 Legacy Skill

이 레포에는 두 가지 형태의 skill이 공존합니다.

- Structured skill
  `astro`, `react`, `css`, `tanstack-route`, `playwright-test`, `typescript`, `nestjs`
- Legacy single-document skill
  `java`

structured skill은 작은 rule 문서를 조합해 slim `AGENTS.md`를 생성합니다.
legacy skill은 단일 문서를 직접 정본으로 사용합니다.

현재 `react`, `nestjs`, `tanstack-route`, `playwright-test`는 `metadata.json.extends`로 `typescript` companion skill 관계를 선언합니다.  
`astro`는 `metadata.json.extends`로 `typescript`, `css` companion skill 관계를 선언합니다.  
즉, framework skill은 local 규칙에 집중하고 공통 TypeScript/CSS 규칙은 companion skill을 함께 로드하는 방식으로 사용합니다.

## 저장소 구조

```text
agent-conventions/
  skill/
    astro/
      AGENTS.md
      README.md
      SKILL.md
      metadata.json
      rules/
        _sections.md
        _template.md
        *.md
    react/
      AGENTS.md
      README.md
      SKILL.md
      metadata.json
      deprecated/
        react.md
      rules/
        _sections.md
        _template.md
        *.md
    css/
      ...
    tanstack-route/
      ...
    playwright-test/
      ...
    typescript/
      ...
    nestjs/
      ...
    java/
      SKILL.md
      api.md
      springboot.md
  package/
    package.json
    README.md
    src/
      *.ts
    test/
      *.test.ts
  reference/
    agent-skills-main/
      ...
```

## Structured Skill Anatomy

structured skill 하나는 보통 아래 형태를 가집니다.

```text
skill/react/
  SKILL.md
  README.md
  metadata.json
  AGENTS.md
  rules/
    _sections.md
    _template.md
    *.md
  deprecated/
    react.md
```

- `SKILL.md`
  skill 이름, description, activation checklist, companion skill/load guidance를 담는 엔트리포인트입니다.
- `README.md`
  사람이 읽는 개요 문서입니다.
- `metadata.json`
  build 입력 메타데이터입니다.
- `metadata.json.extends`
  함께 로드할 companion skill 관계를 선언합니다.
- `rules/_sections.md`
  섹션 순서와 설명을 관리합니다.
- `rules/_template.md`
  새 rule 작성 템플릿입니다.
- `rules/*.md`
  실제 source of truth rule 문서입니다.
- `AGENTS.md`
  build 결과로 생성되는 slim local guide입니다.
- `deprecated/*.md`
  이전 single-document 버전을 보관합니다.

정리하면, structured skill에서 사람이 직접 수정하는 정본은
`rules/_sections.md`, `rules/_template.md`, `rules/*.md`, `metadata.json`이고,
`AGENTS.md`는 생성물입니다.

## 설치

에이전트가 시작 시 `~/.agents/skills/`를 스캔한다면,
이 저장소의 `skill/` 디렉터리를 symlink로 연결하는 방식이 가장 단순합니다.

```bash
mkdir -p ~/.agents/skills
ln -s /absolute/path/to/agent-conventions/skill ~/.agents/skills/conventions
```

이미 `~/.agents/skills/conventions`가 있으면 먼저 백업한 뒤 교체합니다.

```bash
mv ~/.agents/skills/conventions ~/.agents/skills/conventions.backup
ln -s /absolute/path/to/agent-conventions/skill ~/.agents/skills/conventions
```

symlink를 추가하거나 교체한 뒤에는 에이전트를 재시작하는 편이 안전합니다.

## Optional Companion Packs

이 저장소는 standalone convention skill pack으로 사용할 수 있습니다.
즉, 기본 설치는 이 레포의 `skill/`만 연결해도 충분합니다.

다만 subagent orchestration, plan execution, verification workflow까지 함께 쓰고 싶다면
별도의 companion pack을 추가로 설치하는 구성을 권장합니다.

- 권장 companion pack: `superpowers`
- 적합한 경우: 독립 작업 분리, 서브에이전트 review loop, 구현 전후 verification workflow를 팀 공통 방식으로 맞추고 싶을 때
- 비필수: 이 저장소의 convention skill 자체는 `superpowers` 없이도 사용할 수 있습니다.

consuming project의 `AGENTS.md`가 `subagent-driven-development` 같은 specific skill name을 직접 참조한다면,
그 프로젝트에서는 해당 companion pack 설치를 전제로 적어 두는 편이 안전합니다.

## 수정 Workflow

skill을 수정할 때는 아래 순서를 권장합니다.

1. 대상이 structured skill인지 legacy skill인지 먼저 확인합니다.
2. structured skill이면 `rules/_sections.md`, `rules/_template.md`, `rules/*.md`,
   그리고 필요한 `metadata.json`을 수정합니다.
   skill 사용 흐름이나 companion load 기준이 바뀌면 `SKILL.md`도 함께 갱신합니다.
3. `extends`가 있다면 공통 규칙을 companion skill에 둘지, local overlay로 둘지
   먼저 판단합니다.
4. generic TypeScript 규칙이면 가능하면
   [skill/typescript](./skill/typescript/README.md) 쪽을 먼저 수정합니다.
5. framework-specific 규칙이면 해당 skill의 local rule만 수정합니다.
6. structured skill 변경 후에는 validate와 build를 다시 실행합니다.
7. skill 인벤토리나 구조 설명이 바뀌면 루트 README도 함께 갱신합니다.

legacy skill이면 해당 단일 문서를 직접 수정합니다.

## 자주 쓰는 명령

처음 한 번은 build package 의존성을 설치합니다.

```bash
npm --prefix package install
```

단일 structured skill 검증:

```bash
npm --prefix package run validate -- --skill=react
```

단일 structured skill build:

```bash
npm --prefix package run build -- --skill=react
```

단일 structured skill validate + build:

```bash
npm --prefix package run dev:react
```

전체 structured skill 검증/생성:

```bash
npm --prefix package run validate -- --all
npm --prefix package run build -- --all
```

더 자세한 script 설명은 [package/README.md](./package/README.md)에서 확인할 수 있습니다.
각 skill 폴더 안에서 직접 작업할 때는 해당 skill의 `README.md`에 있는
skill-relative 명령을 사용하는 편이 안전합니다.

## 프로젝트에서 쓰는 방법

각 프로젝트는 자체 `AGENTS.md`에서 필요한 skill 이름을 명시적으로 참조하고,
그 위에 프로젝트 고유 제약을 덧붙이는 방식을 권장합니다.

복사해서 시작할 수 있는 공통 예시는 루트에 함께 둡니다.

- [AGENTS.superpowers.md](./AGENTS.superpowers.md)
  `superpowers` workflow만 고정하고, 코드 규칙은 프로젝트 자체 문서로 관리하는 예시
- [AGENTS.superpowers.conventions.md](./AGENTS.superpowers.conventions.md)
  `superpowers` workflow와 `agent-conventions` pack selection/audit까지 함께 운영하는 강한 정책 예시

예를 들면 아래처럼 역할을 나누는 구성이 자연스럽습니다.

- 공통 스타일, 경계, 문서화 규칙: 이 저장소의 skill
- 생성 파일 보호, 검증 명령, 배포 규칙: 프로젝트 로컬 `AGENTS.md`

서브에이전트 workflow도 같은 원칙으로 나누는 편이 유지보수에 유리합니다.

- 여러 프로젝트에 공통으로 적용할 수 있는 권장 협업 방식: 이 저장소의 skill 또는 companion/orchestration skill
- 이 프로젝트에서 반드시 지켜야 하는 서브에이전트 사용 조건, 예외, 병렬 실행 범위, 최종 검증 책임: 프로젝트 로컬 `AGENTS.md`

즉, 이 저장소에는 "이런 상황에서는 context를 분리한 서브에이전트 협업을 권장한다" 같은 재사용 가능한 가이드를 두고,
실제 consuming project에서는 "이 조건에서는 반드시 쓴다", "이 경우에는 병렬 금지", "최종 통합은 메인 에이전트가 맡는다" 같은
강제 정책을 두는 구성을 기본값으로 권장합니다.

TypeScript 기반 framework 프로젝트에서는 framework skill 하나만 적기보다
`convention-astro` + `convention-typescript` 또는 `convention-react` + `convention-typescript`처럼 companion skill을 함께 적는 구성을 권장합니다.

## 버전 관리 가이드

- 각 skill의 `SKILL.md`에 있는 `name` 변경은 breaking change로 봅니다.
- 새 skill 추가나 호환되는 규칙 확장은 minor 버전으로 관리합니다.
- 문구 수정, 예시 보강, 비호환성 없는 보정은 patch 버전으로 관리합니다.

## 참고 자료

`reference/agent-skills-main/`은 skill pack 구조와 문서 톤을 비교할 때 참고하는 외부 레퍼런스입니다.
다만 이 레포의 source of truth는 항상 현재 `skill/`과 `package/` 아래 문서와 코드입니다.
