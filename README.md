# agent-conventions

팀 코딩 컨벤션을 AI coding agent skill 형태로 관리하는 공용 저장소입니다.  
이 레포는 실제 배포 대상 `skill/`과 build/validate tooling인 [package/](./package/README.md)를 함께 제공합니다.  
프로젝트의 [AGENTS.md](./AGENTS.md)에서 이 저장소의 skill 이름을 참조하면 공통 규칙을 팀 단위로 재사용할 수 있습니다.

- `skill/` 아래의 실제 배포 대상 skill
- [package/](./package/README.md) 아래의 build/validate tooling

## 포함된 Skill

현재 포함된 skill은 아래와 같습니다.

- [`convention-react`](./skill/react/SKILL.md): React 컴포넌트 경계, route-local 분리, handler 흐름, state 오리진, 문서화 규칙
- [`convention-css`](./skill/css/SKILL.md): CSS 네이밍, selector 깊이, wrapper 기준 스타일링, 디자인 토큰 규칙
- [`convention-tanstack-route`](./skill/tanstack-route/SKILL.md): TanStack Router file-based route, layout shell, redirect, search param, route-local helper 규칙
- [`convention-playwright-test`](./skill/playwright-test/SKILL.md): Playwright integration/e2e 경계, locator 선택, waiting, mocking, 데이터 고립 규칙
- [`convention-typescript`](./skill/typescript/SKILL.md): TypeScript import, custom type, helper 분리, fallback 처리, JSDoc 규칙
- [`convention-nestjs`](./skill/nestjs/SKILL.md): NestJS module/controller/service/DTO/Prisma/테스트 경계 규칙
- [`convention-springboot`](./skill/java/SKILL.md): Spring Boot 기반 백엔드 컨벤션

## 현재 구조 상태

다음 skill은 각 폴더의 [rules/_sections.md](./skill/react/rules/_sections.md)와 `rules/*.md`를 source of truth로 사용하는 structured skill입니다.

- [react](./skill/react/README.md)
- [css](./skill/css/README.md)
- [tanstack-route](./skill/tanstack-route/README.md)
- [playwright-test](./skill/playwright-test/README.md)
- [typescript](./skill/typescript/README.md)
- [nestjs](./skill/nestjs/README.md)

다음 skill은 아직 legacy single-document 구조입니다.

- [java](./skill/java/SKILL.md)

structured skill은 개별 rule 문서를 조합해 [AGENTS.md](./skill/react/AGENTS.md) 같은 compiled guide를 생성하고, legacy skill은 단일 문서를 직접 참조합니다.

현재 `react`, `nestjs`, `tanstack-route`, `playwright-test`는 `metadata.json`의 `extends`를 통해`typescript` base skill을 함께 compile합니다.  
즉, 언어 공통 규칙은 [skill/typescript/rules/_sections.md](./skill/typescript/rules/_sections.md)와 `rules/*.md` 아래에 두고 프레임워크 skill은 overlay 규칙에 집중합니다.

## 저장소 구조

```text
agent-conventions/
  skill/
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

- `skill/`은 실제 agent가 읽는 skill pack입니다.
- [package/](./package/README.md)는 structured skill의 build/validate tooling입니다.
- [reference/](./reference/agent-skills-main/README.md)는 외부 사례나 비교용 레퍼런스를 보관하는 공간입니다.

## Structured Skill Layout

structured skill은 공통적으로 아래 파일을 가집니다.

- [`SKILL.md`](./skill/react/SKILL.md): skill 이름, 설명, 사용 시점 같은 discovery metadata
- [`README.md`](./skill/react/README.md): 사람 기준 개요와 규칙 탐색 진입점
- `metadata.json`: build 입력 메타데이터
- `metadata.json.extends`: 현재 skill이 함께 포함할 base skill 목록
- [`rules/_sections.md`](./skill/react/rules/_sections.md): 섹션 순서와 구성 설명
- [`rules/_template.md`](./skill/react/rules/_template.md): 새 rule 작성 템플릿
- [rules/_sections.md](./skill/react/rules/_sections.md): 섹션 구성과 우선순위 메타데이터
- [rules/_template.md](./skill/react/rules/_template.md): 새 rule 작성 템플릿
- `rules/*.md`: 실제 source of truth rule 문서
- [`AGENTS.md`](./skill/react/AGENTS.md): build 결과물로 생성되는 통합 가이드
- [`deprecated/*.md`](./skill/react/deprecated/react.md): 이전 single-document 버전 보관본

즉, structured skill에서는 로컬 [rules/_sections.md](./skill/react/rules/_sections.md), [rules/_template.md](./skill/react/rules/_template.md), `rules/*.md`와 `metadata.json.extends`로 연결된 base skill의 rule 문서가 정본이고 [AGENTS.md](./skill/react/AGENTS.md)는 생성물입니다.

## 설치

에이전트가 시작 시 `~/.agents/skills/`를 스캔하도록 사용하는 경우, 이 저장소의 `skill/` 디렉터리를 symlink로 연결하는 방식이 가장 단순합니다.

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

## 수정 Workflow

skill을 수정할 때는 아래 순서를 권장합니다.

1. 대상 skill이 structured인지 legacy인지 먼저 확인합니다.
2. structured skill이면 [rules/_sections.md](./skill/react/rules/_sections.md), [rules/_template.md](./skill/react/rules/_template.md), `rules/*.md`와 필요한 보조 파일을 수정합니다.
3. `metadata.json`에 `extends`가 있으면 base skill 쪽이 정본인지 overlay skill 쪽이 정본인지 먼저 판단합니다.
4. generic TypeScript 규칙이면 가능하면 [skill/typescript/rules/_sections.md](./skill/typescript/rules/_sections.md)와 `rules/*.md`를 먼저 수정합니다.
5. framework-specific overlay만 대상이면 해당 skill의 local rule을 수정합니다.
6. structured skill 변경 후에는 validate와 build를 다시 실행합니다.
7. 필요하면 루트 [README.md](./README.md)나 프로젝트 문서의 skill 인벤토리 설명도 함께 갱신합니다.

legacy skill이면 해당 단일 문서를 직접 수정합니다.

처음 한 번은 build package 의존성을 설치합니다.

```bash
npm --prefix package install
```

단일 structured skill 검증/생성:

```bash
npm --prefix package run validate -- --skill=react
npm --prefix package run build -- --skill=react
```

전체 structured skill 검증/생성:

```bash
npm --prefix package run validate -- --all
npm --prefix package run build -- --all
```

추가 alias와 스크립트 설명은 [package/README.md](./package/README.md)에서 확인할 수 있습니다.

## 프로젝트 연동

각 프로젝트는 자체 `AGENTS.md`에서 필요한 skill 이름을 명시적으로 참조하고, 그 위에 프로젝트 고유 제약을 덧붙이는 방식을 권장합니다.

예를 들면 아래와 같은 역할 분리가 자연스럽습니다.

- 공통 스타일, 경계, 문서화 규칙: 이 저장소의 skill
- 생성 파일 보호, 검증 명령, 배포 규칙: 프로젝트 로컬 `AGENTS.md`

## 버전 관리 가이드

- [`SKILL.md`](./skill/react/SKILL.md)의 `name` 변경은 breaking change로 취급합니다.
- 새 skill 추가나 호환되는 규칙 확장은 minor 버전으로 관리합니다.
- 문구 수정, 예시 보강, 비호환성 없는 보정은 patch 버전으로 관리합니다.

## 참고 자료

`reference/agent-skills-main/`은 skill pack 구조와 문서 톤을 비교할 때 참고하는 외부 레퍼런스입니다.   
다만 이 레포의 source of truth는 항상 현재 `skill/`과 `package/` 아래 문서/코드입니다.
