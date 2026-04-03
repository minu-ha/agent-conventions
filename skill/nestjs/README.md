# NestJS 컨벤션

에이전트 협업, 리뷰, AI 보조 리팩터링에 맞춰 NestJS 컨벤션을 관리하는 구조화된 저장소입니다.  
현재 NestJS 가이드는 7개 local 섹션의 21개 rule 파일로 구성되어 있습니다.  
최종적으로 slim [AGENTS.md](./AGENTS.md)로 compile됩니다. local guide는 NestJS 규칙만 담고 `typescript` companion skill을 함께 사용합니다.

## 구조

- [rules/_sections.md](./rules/_sections.md) - rule 섹션 구성 메타데이터
- [rules/_template.md](./rules/_template.md) - 새 rule 작성용 템플릿
- `area-description.md` - 실제 rule 파일 패턴
- [metadata.json](./metadata.json) - compiled guide 메타데이터
- [AGENTS.md](./AGENTS.md) - 에이전트가 읽는 compiled 결과물
- [deprecated/nestjs.md](./deprecated/nestjs.md) - 마이그레이션 검토용 legacy 단일 문서
- [package/README.md](../../package/README.md) - `skill/*` build, validation, typecheck, test를 담당하는 standalone TypeScript npm package

## 시작하기

1. Validate rule files:
   ```bash
   npm --prefix ../../package run validate:nestjs
   ```

2. Build [AGENTS.md](./AGENTS.md) from rules:
   ```bash
   npm --prefix ../../package run build:nestjs
   ```

3. Validate and build together:
   ```bash
   npm --prefix ../../package run dev:nestjs
   ```

4. Verify the build package itself:
   ```bash
   npm --prefix ../../package run typecheck
   npm --prefix ../../package run test
   ```

## 새 Rule 추가하기

1. [rules/_template.md](./rules/_template.md)를 `rules/area-description.md`로 복사합니다.
2. 알맞은 area prefix를 고릅니다.
   - `naming-` - Nest 파일명, 모듈 폴더 소유권, 상수 배치 규칙
   - `layers-` - controller/service 책임과 의존 방향 규칙
   - `dto-` - DTO 검증, response shaping, Prisma 타입 재사용, backend 타입 문서화 규칙
   - `methods-` - 메서드 스타일, async 처리, exception 패턴 규칙
   - `docs-` - 역할 기반 annotation 태그와 NestJS/Prisma inline comment 규칙
   - `testing-` - unit/e2e scope, 배치, 라이브러리, coverage trigger 규칙
   - `guardrails-` - 금지 shortcut과 마무리 review check 규칙
3. frontmatter와 본문을 작성합니다.
4. 설명이 포함된 incorrect/correct 예시를 넣습니다.
5. `npm --prefix ../../package run dev:nestjs`를 실행해 [AGENTS.md](./AGENTS.md)를 다시 생성합니다.

## Rule 파일 구조

Each rule file should follow this structure:

````markdown
---
title: Rule Title Here
impact: MEDIUM
impactDescription: 선택적 영향도 설명
tags: tag1, tag2
---

## Rule Title Here

**Impact: MEDIUM (선택적 영향도 설명)**

규칙의 핵심과 이유를 짧고 분명하게 설명합니다.

**Incorrect (무엇이 문제인지 설명):**

```ts
// 나쁜 예시
```

**Correct (무엇이 좋아졌는지 설명):**

```ts
// 좋은 예시
```
````

## 파일명 규칙

- `_`로 시작하는 파일은 특수 파일이며 compiled guide에서 제외됩니다.
- Rule 파일은 `area-description.md` 형식을 사용합니다. 예: `layers-keep-controllers-thin-and-boundary-focused.md`
- Section은 파일명 prefix로 결정됩니다.
- Rule은 각 section 안에서 title 기준 알파벳 순으로 정렬됩니다.
- [AGENTS.md](./AGENTS.md)의 rule 번호는 자동 생성됩니다.

## Impact 레벨

- `CRITICAL` - 런타임 레이어링, API 정확성, backend 테스트 신뢰도에 직접 영향할 가능성이 큰 최우선 규칙
- `HIGH` - 유지보수성과 가독성에 큰 영향을 주는 규칙
- `MEDIUM-HIGH` - 일반적인 구현 작업에서 강하게 권장되는 규칙
- `MEDIUM` - 일관성과 리뷰 규율에는 중요하지만 핵심 흐름 규칙보다는 우선순위가 낮은 규칙
- `LOW` - 상황이 맞을 때 적용하면 좋은 보강 규칙

## 스크립트

- `npm --prefix ../../package run build:nestjs` - NestJS rule만 compile해서 [AGENTS.md](./AGENTS.md) 생성
- `npm --prefix ../../package run validate:nestjs` - NestJS rule만 검증
- `npm --prefix ../../package run dev:nestjs` - NestJS만 validate 후 build까지 연속 실행
- `npm --prefix ../../package run build:all` - `skill/` 아래 build 가능한 skill 전체 build
- `npm --prefix ../../package run validate:all` - `skill/` 아래 build 가능한 skill 전체 validate
- `npm --prefix ../../package run dev:all` - `skill/` 아래 build 가능한 skill 전체 validate + build
- `npm --prefix ../../package run typecheck` - standalone build package 타입 검사
- `npm --prefix ../../package run test` - build package용 CLI/파서/문서 회귀 테스트 실행
- `cd ../../package && npm run build:nestjs` - package 로컬 위치에서 NestJS build 스크립트 직접 실행

## 마이그레이션 메모

- [rules/_sections.md](./rules/_sections.md), [rules/_template.md](./rules/_template.md), `rules/*.md`가 source of truth입니다.
- [AGENTS.md](./AGENTS.md)는 에이전트가 먼저 읽는 compiled 문서입니다.
- [deprecated/nestjs.md](./deprecated/nestjs.md)는 원래 단일 문서와 마이그레이션 완성도를 비교하기 위해 남겨 둡니다.
- `metadata.json`의 `extends`는 `typescript` companion skill 관계를 선언합니다.
- generic TypeScript rule은 [../typescript/rules/_sections.md](../typescript/rules/_sections.md)와 `../typescript/rules/*.md`가 정본이고, NestJS rule은 Prisma/Nest boundary overlay에 집중합니다.
- 공용 TypeScript build package는 raw CLI 형태와 per-skill alias를 모두 제공합니다.

## 기여 가이드

rule을 추가하거나 수정할 때는 아래 순서를 따릅니다.

1. section에 맞는 filename prefix를 사용합니다.
2. [_template.md](./rules/_template.md) 구조를 따릅니다.
3. 예시는 실제 NestJS controller, service, DTO, Prisma 접근, 테스트 코드와 가깝고 구체적으로 작성합니다.
4. 새 카테고리를 추가했다면 section metadata도 함께 갱신합니다.
5. 마무리 전에 `npm --prefix ../../package run dev:nestjs`를 실행합니다.
