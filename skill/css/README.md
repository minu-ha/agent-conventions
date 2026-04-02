# CSS 컨벤션

에이전트 협업, 리뷰, AI 보조 리팩터링에 맞춰 CSS 컨벤션을 관리하는 구조화된 저장소입니다.  
현재 CSS 가이드는 5개 섹션의 20개 rule 파일로 구성되어 있습니다.  
최종적으로 [AGENTS.md](./AGENTS.md)로 compile됩니다.

## 구조

- [rules/_sections.md](./rules/_sections.md) - rule 섹션 구성 메타데이터
  - [_sections.md](./rules/_sections.md) - 섹션 메타데이터
  - [_template.md](./rules/_template.md) - 새 rule 작성용 템플릿
  - `area-description.md` - 실제 rule 파일
- `metadata.json` - compiled guide 메타데이터
- __[AGENTS.md](./AGENTS.md)__ - 에이전트가 읽는 compiled 결과물
- [deprecated/css.md](./deprecated/css.md) - 마이그레이션 검토용 legacy 단일 문서
- [package/README.md](../../package/README.md) - `skill/*` build, validation, typecheck, test를 담당하는 standalone TypeScript npm package

## 시작하기

1. Validate rule files:
   ```bash
   npm --prefix package run validate:css
   ```

2. Build [AGENTS.md](./AGENTS.md) from rules:
   ```bash
   npm --prefix package run build:css
   ```

3. Validate and build together:
   ```bash
   npm --prefix package run dev:css
   ```

4. Verify the build package itself:
   ```bash
   npm --prefix package run typecheck
   npm --prefix package run test
   ```

## 새 Rule 추가하기

1. [rules/_template.md](./rules/_template.md)를 `rules/area-description.md`로 복사합니다.
2. 알맞은 area prefix를 고릅니다.
   - `naming-` - 클래스 문법, slug 추적성, 네임스페이스 소유권, local-vs-route scope 규칙
   - `composition-` - TSX class 조합과 wrapper 스타일링 경계 규칙
   - `selector-` - flat selector, pseudo-class, 서드파티 DOM 타게팅 규칙
   - `values-` - 토큰, fallback, 레이아웃 의도, 상호작용 상태 규칙
   - `organization-` - stylesheet 소유권, section comment, 금지 패턴 점검 규칙
3. frontmatter와 본문을 작성합니다.
4. 설명이 포함된 incorrect/correct 예시를 넣습니다.
5. `npm --prefix package run dev:css`를 실행해 [AGENTS.md](./AGENTS.md)를 다시 생성합니다.

## Rule 파일 구조

각 rule 파일은 아래 구조를 따릅니다.

```markdown
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

```tsx
// 나쁜 예시
```

**Correct (무엇이 좋아졌는지 설명):**

```tsx
// 좋은 예시
```
```

## 파일명 규칙

- `_`로 시작하는 파일은 특수 파일이며 compiled guide에서 제외됩니다.
- Rule 파일은 `area-description.md` 형식을 사용합니다. 예: `selector-target-third-party-dom-from-owned-roots.md`
- Section은 파일명 prefix로 결정됩니다.
- Rule은 각 section 안에서 title 기준 알파벳 순으로 정렬됩니다.
- [AGENTS.md](./AGENTS.md)의 rule 번호는 자동 생성됩니다.

## Impact 레벨

- `CRITICAL` - 전역 일관성, selector 안정성, 소유권 명확성에 직접 영향할 가능성이 큰 최우선 규칙
- `HIGH` - 유지보수성, 가독성, 상호작용 정확성에 큰 영향을 주는 규칙
- `MEDIUM-HIGH` - 일반적인 기능 작업에서 강하게 권장되는 규칙
- `MEDIUM` - 일관성과 리뷰 규율에는 중요하지만 핵심 흐름 규칙보다는 우선순위가 낮은 규칙
- `LOW` - 상황이 맞을 때 적용하면 좋은 보강 규칙

## 스크립트

- `npm --prefix package run build:css` - CSS rule만 compile해서 [AGENTS.md](./AGENTS.md) 생성
- `npm --prefix package run validate:css` - CSS rule만 검증
- `npm --prefix package run dev:css` - CSS만 validate 후 build까지 연속 실행
- `npm --prefix package run build:all` - `skill/` 아래 build 가능한 skill 전체 build
- `npm --prefix package run validate:all` - `skill/` 아래 build 가능한 skill 전체 validate
- `npm --prefix package run dev:all` - `skill/` 아래 build 가능한 skill 전체 validate + build
- `npm --prefix package run typecheck` - standalone build package 타입 검사
- `npm --prefix package run test` - build package용 CLI/파서/문서 회귀 테스트 실행
- `cd package && npm run build:css` - package 로컬 위치에서 CSS build 스크립트 직접 실행

## 마이그레이션 메모

- [rules/_sections.md](./rules/_sections.md), [rules/_template.md](./rules/_template.md), `rules/*.md`가 source of truth입니다.
- [AGENTS.md](./AGENTS.md)는 에이전트가 먼저 읽는 compiled 문서입니다.
- [deprecated/css.md](./deprecated/css.md)는 원래 단일 문서와 마이그레이션 완성도를 비교하기 위해 남겨 둡니다.
- 공용 TypeScript build package는 raw CLI 형태와 per-skill alias를 모두 제공합니다.

## 기여 가이드

rule을 추가하거나 수정할 때는 아래 순서를 따릅니다.

1. section에 맞는 filename prefix를 사용합니다.
2. [_template.md](./rules/_template.md) 구조를 따릅니다.
3. 예시는 실제 route, component, wrapper 스타일링 코드와 가깝고 구체적으로 작성합니다.
4. 새 카테고리를 추가했다면 section metadata도 함께 갱신합니다.
5. 마무리 전에 `npm --prefix package run dev:css`를 실행합니다.
