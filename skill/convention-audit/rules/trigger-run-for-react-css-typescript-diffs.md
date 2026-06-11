---
title: Run Convention Audit for React, CSS, and TypeScript Diffs
impact: CRITICAL
impactDescription: convention skill을 로드했다는 말만 남기고 판단형 rule 검증을 건너뛰는 것을 막음
tags: trigger, scope, companion
---

## Run Convention Audit for React, CSS, and TypeScript Diffs

**Impact: CRITICAL (convention skill을 로드했다는 말만 남기고 판단형 rule 검증을 건너뛰는 것을 막음)**

React 컴포넌트, TSX 화면 흐름, TypeScript support code, CSS/className, shared/helper/config 경계가 바뀌면 이 audit을 완료 전 필수 단계로 사용합니다. 이 skill은 `convention-react`, `convention-css`, `convention-typescript`를 대체하지 않습니다. 세 companion skill의 rule 원문을 실제 diff에 적용했는지 검증하는 마지막 gate입니다.

시작 시 확정할 것:

- 변경 파일 목록
- 변경 intent와 primary scope
- 적용할 companion skill
- 자동 checker 또는 수동 audit packet 생성 방식
- 완료 전 reviewer 방식: subagent reviewer, 별도 세션 reviewer, 또는 main-agent strict reviewer

**Incorrect (스킬 이름만 나열):**

```md
React/CSS/TypeScript 스킬을 적용했습니다. lint와 build가 통과했습니다.
```

**Correct (audit을 완료 조건으로 고정):**

```md
Convention audit 대상:
- skill: convention-react, convention-css, convention-typescript
- changed files: src/pages/detail/local/**, src/pages/detail/detail-page.css
- evidence: diff, file outline, imports, exports, CSS selector map, query select chain
- reviewer: independent code quality reviewer
- completion rule: FAIL/UNKNOWN 0개
```
