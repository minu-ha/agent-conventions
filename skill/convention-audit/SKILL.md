---
name: convention-audit
description: Use when completing or reviewing React, CSS, or TypeScript code changes that must prove agent-conventions compliance, especially when modularity, encapsulation, route-local boundaries, helper extraction, data flow, or selector ownership could be disputed.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# Convention Audit

React/CSS/TypeScript convention skill을 "사용했다"고 말하는 데서 끝내지 않고, 실제 diff가 룰을 지켰는지 증거 기반 semantic review로 검증하는 완료 gate입니다.

## 사용할 때

- React, TSX, TypeScript support code, CSS, className, shared/helper/config 경계가 바뀐 뒤 완료를 주장하기 전
- 사용자가 "컨벤션을 완벽하게 지켜", "react/css/typescript 스킬 룰 확인", "모듈화/캡슐화가 맞는지 봐"라고 요구한 경우
- route entry, local component 분리, helper 추출, query shaping, shared 승격, CSS ownership처럼 자동 lint가 판단하기 어려운 변경
- 기존 lint/build/test가 통과했지만 convention 준수 여부가 불확실한 경우

## 핵심 원칙

- 이 skill은 `convention-react`, `convention-css`, `convention-typescript`를 대체하지 않습니다. 반드시 함께 로드해 rule 원문을 기준으로 삼습니다.
- 자동 checker가 있으면 최종 판정자가 아니라 audit packet 생성기로 사용합니다.
- PASS는 rule 원문과 변경 증거가 함께 있을 때만 허용합니다.
- FAIL 또는 UNKNOWN이 하나라도 있으면 완료하지 않습니다.

## 필수 Workflow

1. 적용할 companion skill을 확정합니다.
   - TSX/React: `convention-react` + `convention-typescript`
   - CSS/className: `convention-css`
   - TS helper/type/config: `convention-typescript`
2. 변경 파일과 primary scope를 확정합니다.
3. audit packet을 만듭니다.
   - 프로젝트에 `tools/conventions/check.ts`, `npm run convention:audit`, `npm run lint:conventions`가 있으면 실행합니다.
   - 없으면 diff, file outline, import/export, state/data flow, CSS selector map, helper callsite를 수동으로 요약합니다.
4. Rule Coverage Matrix를 작성합니다.
   - 파일별로 관련 rule id를 적습니다.
   - 무관한 rule은 근거와 함께 `NOT_APPLICABLE`로 둡니다.
5. semantic reviewer를 실행합니다.
   - subagent/reviewer tool이 있으면 독립 reviewer를 사용합니다.
   - 없으면 main agent가 reviewer mode로 전환하고 같은 matrix를 작성합니다.
6. verdict를 작성합니다.
   - `PASS`, `FAIL`, `UNKNOWN`, `NOT_APPLICABLE`
   - 각 verdict에는 evidence와 reasoning을 붙입니다.
7. FAIL/UNKNOWN이 있으면 수정 후 audit packet과 review를 반복합니다.
8. 완료 보고에 최종 matrix 요약을 포함합니다.

## Reviewer Prompt Template

```md
You are a strict convention semantic reviewer.

Review the diff against these skills:
- convention-react
- convention-css
- convention-typescript

Inputs:
- Changed files:
- Audit packet:
- Rule coverage matrix:
- Diff summary:

Instructions:
- Do not treat lint/build/test success as convention success.
- For every listed rule, return PASS, FAIL, UNKNOWN, or NOT_APPLICABLE.
- PASS requires concrete evidence from the diff or audit packet.
- FAIL/UNKNOWN must include file, reason, and required fix.
- Pay special attention to modularity, encapsulation, route-local ownership, helper extraction, query select/data shaping, shared promotion, CSS owner prefixes, selector boundaries, and fallback handling.
- If evidence is missing, return UNKNOWN instead of guessing.
```

## Audit Packet Template

```md
# Convention Audit Packet

## Changed Files
- path:
  - concern:
  - scope owner:
  - added/removed exports:
  - imports crossing owner boundary:

## React Evidence
- route entries:
- local components:
- components declared inside components:
- handlers:
- hooks:
- state/store/query origin:
- query select and post-select shaping:

## TypeScript Evidence
- new/changed types:
- helpers extracted:
- helper callsites:
- shared/config/util promotion:
- fallback/optional handling:
- JSDoc boundary declarations:

## CSS Evidence
- stylesheets:
- owner class prefixes:
- third-party selectors:
- selector depth/nesting:
- token and CSS variable fallback:

## Verification
- automatic checks:
- semantic review:
- browser/runtime checks if relevant:
```

## Final Report Template

```md
Convention audit:
- skills: convention-react, convention-css, convention-typescript
- packet: <command or manual>
- reviewer: <independent reviewer | main-agent reviewer>
- verdict: PASS <n>, FAIL 0, UNKNOWN 0, NOT_APPLICABLE <n>
- exceptions: none
```

## 상세 규칙

- [AGENTS.md](./AGENTS.md) - compiled local guide
- [pressure-tests.md](./pressure-tests.md) - baseline failure와 pressure scenario 검증 세트
- [rules/_sections.md](./rules/_sections.md), [rules/_template.md](./rules/_template.md), `rules/*.md` - source of truth
