---
title: Treat Companion Skills as Required Review Inputs
impact: CRITICAL
impactDescription: React 변경에서 TypeScript/CSS companion rule이 빠지는 반복 누락을 막음
tags: coverage, companion, required
---

## Treat Companion Skills as Required Review Inputs

**Impact: CRITICAL (React 변경에서 TypeScript/CSS companion rule이 빠지는 반복 누락을 막음)**

React/TSX 변경은 기본적으로 `convention-react`와 `convention-typescript`를 함께 봅니다. `className`, CSS import, stylesheet, selector, token이 바뀌면 `convention-css`도 필수입니다. audit에서 companion skill을 제외하려면 "이번 diff에는 해당 표면이 없다"는 파일 근거가 있어야 합니다.

**Incorrect (React만 보고 종료):**

```md
TSX를 수정했지만 React 구조만 확인했습니다. CSS는 스타일 파일이 작아서 생략했습니다.
```

**Correct (companion 제외도 증거로 설명):**

```md
Companion coverage:
- convention-react: TSX render/state/helper 경계 변경으로 필수
- convention-typescript: model.ts helper/type/export 변경으로 필수
- convention-css: className과 css 파일 변경으로 필수
- convention-playwright-test: 테스트 파일 미수정, 브라우저 e2e 미작성이라 제외
```
