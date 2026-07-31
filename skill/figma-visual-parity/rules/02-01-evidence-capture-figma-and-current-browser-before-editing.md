---
title: Capture Figma Evidence and Current Browser State Before Editing
titleKo: 수정 전 Figma·현재 화면 우선 캡처
impact: CRITICAL
impactDescription: 기준 화면과 현재 화면 없이 CSS를 추측 수정하는 일을 막습니다
tags: evidence, screenshot, browser
---

## Capture Figma Evidence and Current Browser State Before Editing

**Impact: CRITICAL (기준 화면과 현재 화면 없이 CSS를 추측 수정하는 일을 막습니다)**

구현 전에 Figma node/design context/screenshot과 현재 브라우저 구현 화면을 모두 확인합니다.
Figma node가 너무 크거나 tool fetch가 실패하면 더 작은 node, parent section, screenshot, metadata fallback을 사용하고,
확보한 evidence와 한계를 기록합니다.

**Incorrect (Figma node 실패를 이유로 분석 포기):**

```md
Figma context fetch 실패. 기존 화면만 보고 spacing을 대략 조정한다.
```

**Correct (fallback evidence를 확보하고 한계를 기록):**

```md
Figma node fetch 실패.
1. 더 작은 child node 요청 또는 탐색
2. parent section screenshot 확인
3. metadata fallback으로 레이어명/크기 확인
4. 모르는 항목은 visual diff 표에 "확인 필요"로 기록
```
