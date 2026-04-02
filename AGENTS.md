# AGENTS.md

이 문서는 이 저장소에서 작업하는 AI coding agent를 위한 작업 가이드입니다.

## Repository Overview

이 레포는 팀 공용 coding convention을 skill pack 형태로 관리합니다.

- 실제 skill은 `skill/` 아래에 있습니다.
- structured skill의 build/validate tooling은 `package/` 아래에 있습니다.
- `reference/`는 비교용 레퍼런스이며 source of truth가 아닙니다.

루트 [README.md](/Users/l-20220017/workspace/agent-conventions/README.md)는 사람용 온보딩 문서이고, 이 문서는 agent용 작업 규칙입니다.

## Skill Types

현재 이 레포에는 두 가지 구조가 공존합니다.

### 1. Structured Skill

대상:

- `skill/react`
- `skill/css`
- `skill/tanstack-route`
- `skill/playwright-test`
- `skill/typescript`
- `skill/nestjs`

이 구조에서는 아래 원칙을 지킵니다.

- `rules/*.md`가 source of truth입니다.
- `skill/*/AGENTS.md`는 build 결과물입니다.
- 일부 skill은 `metadata.json`의 `extends`로 base skill을 함께 compile합니다.
- `metadata.json`, `rules/_sections.md`, `README.md`, `SKILL.md`는 서로 설명이 어긋나지 않게 유지합니다.
- 이전 단일 문서는 `deprecated/*.md`에 보관합니다.

### 2. Legacy Skill

대상:

- `skill/java`

이 구조에서는 단일 문서가 정본입니다. structured skill 규칙을 억지로 섞지 말고, 실제 파일 구조를 먼저 확인한 뒤 수정합니다.

## Editing Rules

structured skill을 수정할 때는 아래 순서를 기본으로 사용합니다.

1. 먼저 `SKILL.md`, `README.md`, `metadata.json`, `rules/_sections.md`를 훑어 현재 구성을 확인합니다.
2. 실제 규칙 변경은 `rules/*.md`에서 수행합니다.
3. `metadata.json`에 `extends`가 있으면 base skill과 overlay skill 중 어디가 정본인지 먼저 판단합니다.
4. `skill/*/AGENTS.md`를 수동 source of truth처럼 편집하지 않습니다.
5. 변경 후에는 validate와 build를 다시 실행해 generated output을 갱신합니다.
6. skill 인벤토리나 작업 방식이 바뀌면 루트 `README.md`도 함께 갱신합니다.

새 skill을 추가하거나 legacy skill을 structured skill로 마이그레이션할 때는 가능하면 이미 정리된 `react`, `css`, `typescript` 폴더를 기준 템플릿으로 삼는 편이 안전합니다.

## Commands

의존성 설치:

```bash
npm --prefix package install
```

단일 structured skill 검증:

```bash
npm --prefix package run validate -- --skill=<skill-name>
```

단일 structured skill build:

```bash
npm --prefix package run build -- --skill=<skill-name>
```

전체 structured skill 검증/생성:

```bash
npm --prefix package run validate -- --all
npm --prefix package run build -- --all
```

현재 buildable skill alias는 아래와 같습니다.

- `react`
- `css`
- `nestjs`
- `playwright-test`
- `tanstack-route`
- `typescript`

`java`는 현재 build pipeline 대상이 아닙니다.

## Guardrails

- structured skill에서는 `rules/*.md`를 우선 수정하고 generated `AGENTS.md`를 직접 고친 뒤 끝내지 않습니다.
- generic TypeScript 규칙이면 `typescript` base skill로 올리고, framework skill에는 예외나 overlay만 남기는 쪽을 우선 검토합니다.
- 레포 안의 skill마다 구조가 다를 수 있으므로, 수정 전에 실제 디렉터리 상태를 다시 확인합니다.
- `reference/agent-skills-main`의 문장을 그대로 가져오기보다, 이 레포의 목적과 현재 구조에 맞게 재서술합니다.
- skill 이름, 설명, 섹션 구성, generated output이 서로 어긋나면 이후 유지보수가 어려워지므로 한 번에 같이 맞춥니다.
- 루트 문서를 갱신할 때는 현재 지원 skill 목록과 build 가능 여부를 실제 상태 기준으로 적습니다.
