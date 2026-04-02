---
name: convention-typescript
description: TypeScript 모듈, import, custom type, helper 분리, fallback 처리, JSDoc 규칙을 함께 적용해야 하면 사용합니다.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# TypeScript 컨벤션

에이전트 협업 팀을 위한 TypeScript 코딩 컨벤션 모음입니다. 현재 이 가이드는 6개 카테고리의 21개 규칙으로 구성되어 있습니다.   
네이밍, import 소유권, 타입 계약, helper 분리, 결측값 처리, JSDoc 규칙을 `rules/*.md`와 compiled `AGENTS.md`로 관리합니다.   
이 skill은 React, NestJS, TanStack Route, Playwright Test compiled guide의 공통 base skill로도 사용됩니다.

## 사용할 때
- 일반 TypeScript 모듈, 유틸 파일, 설정 파일, React 전용이 아닌 `*.ts` 파일을 만들거나 수정할 때 사용합니다.
- import 구조, 타입 재사용, helper 분리, 옵셔널 값 처리, 주석 규칙이 중요한 변경에 사용합니다.
- TypeScript house style 기준으로 코드나 문서를 리뷰할 때 사용합니다.

## 우선순위별 규칙 카테고리

| 우선순위 | 카테고리                            | 영향도         | Prefix        |
|------|---------------------------------|-------------|---------------|
| 1    | Naming and Module Boundaries    | HIGH        | `naming-`     |
| 2    | Types and Contracts             | CRITICAL    | `types-`      |
| 3    | Functions and Helper Boundaries | HIGH        | `functions-`  |
| 4    | Absence and Fallback Handling   | HIGH        | `absence-`    |
| 5    | JSDoc and Comment Conventions   | MEDIUM-HIGH | `docs-`       |
| 6    | Guardrails and Review Checks    | MEDIUM      | `guardrails-` |

## 빠른 참조

### 1. Naming and Module Boundaries (HIGH)

- `naming-use-consistent-file-and-symbol-naming` - 파일명, 심볼명, field casing을 예측 가능하게 유지
- `naming-use-direct-imports-and-public-entry-points` - barrel보다 직접 import와 전용 public entry point를 선호
- `naming-centralize-shared-config-namespaces` - shared config는 하나의 public namespace를 통해 노출
- `naming-preserve-config-origin-with-chained-access` - chained access로 config 오리진 보존

### 2. Types and Contracts (CRITICAL)

- `types-prefer-function-variable-types-over-parameter-annotations` - callable contract가 있으면 parameter annotation보다 함수 변수 타입 우선
- `types-reuse-callback-signatures-from-existing-contracts` - 기존 계약에서 callback 시그니처 재사용
- `types-mark-unused-parameters-with-underscore` - 무시하는 parameter도 `_`로 명시
- `types-reuse-existing-contracts-before-new-types` - 새 타입 선언 전 기존 계약 우선 재사용
- `types-document-custom-types-and-shapes` - custom type과 선언형 shape는 field-level JSDoc으로 문서화

### 3. Functions and Helper Boundaries (HIGH)

- `functions-use-named-object-params-for-complex-signatures` - 복잡한 함수 시그니처는 named object param 사용
- `functions-replace-enum-with-as-const-objects` - `enum`은 object literal + `as const`로 대체
- `functions-extract-helpers-only-when-the-boundary-is-real` - helper는 경계가 정당할 때만 추출
- `functions-avoid-imperative-assembly-in-wide-scopes` - 파일 전역 scope의 명령형 조립 회피

### 4. Absence and Fallback Handling (HIGH)

- `absence-expose-optional-values-instead-of-silent-fallbacks` - casual fallback으로 숨기지 말고 결측값을 드러냄

### 5. JSDoc and Comment Conventions (MEDIUM-HIGH)

- `docs-write-concise-korean-comments-about-purpose-and-constraints` - 목적과 제약을 짧은 한글 주석으로 설명
- `docs-require-header-jsdoc-on-key-declarations` - 핵심 경계 선언에는 header JSDoc 요구
- `docs-use-description-for-external-integration-functions` - 외부 연동 함수에는 `@description` 사용
- `docs-use-helper-for-reusable-pure-helper-functions` - 재사용 가능한 순수 helper에는 `@helper` 사용
- `docs-use-tool-for-model-callable-tool-factories` - 모델 호출 가능 tool factory에는 `@tool` 사용
- `docs-keep-inline-comments-for-constraints-and-caveats` - inline comment는 비자명한 제약에만 사용

### 6. Guardrails and Review Checks (MEDIUM)

- `guardrails-review-banned-typescript-shortcuts-before-finishing` - 마무리 전에 금지 TypeScript shortcut 점검

## 함께 쓰기
- `convention-react`, `convention-nestjs`, `convention-tanstack-route`, `convention-playwright-test`의 compiled guide는 이 skill을 base rule 세트로 포함합니다.
- React, TanStack Route, NestJS 같은 프레임워크 영역이라면 해당 전용 skill을 함께 사용합니다.
- route helper나 search schema처럼 router 경계가 함께 바뀌면 `convention-tanstack-route`를 함께 사용합니다.
- TSX 파일과 React component 경계가 함께 바뀌면 `convention-react`를 함께 사용합니다.
- 타입/주석 규칙을 테스트나 fixture에도 반영하면 `convention-playwright-test` 같은 테스트 전용 skill을 함께 사용합니다.

## 사용하는 방법

자세한 설명과 코드 예시는 개별 rule 파일을 읽으면 됩니다.

```text
rules/types-document-custom-types-and-shapes.md
rules/functions-extract-helpers-only-when-the-boundary-is-real.md
```

각 rule 파일에는 아래 내용이 들어 있습니다.
- 규칙이 왜 중요한지에 대한 짧은 설명
- 설명이 붙은 Incorrect 코드 예시
- 설명이 붙은 Correct 코드 예시
- 구현이나 리뷰에 바로 적용할 수 있는 가이드

## 전체 compiled 문서

모든 규칙이 펼쳐진 전체 가이드는 `./AGENTS.md`에서 확인할 수 있습니다.
