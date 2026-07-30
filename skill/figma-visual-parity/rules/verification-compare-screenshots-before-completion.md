---
title: Compare Screenshots Before Completion
titleKo: 완료 전에 스크린샷을 비교
impact: CRITICAL
impactDescription: build/test 성공만으로 visual parity 완료를 선언하는 일을 막음
impactDescriptionKo: build/test 성공만으로 visual parity 완료를 선언하는 일을 막음
tags: verification, screenshot, browser
---

## Compare Screenshots Before Completion

**Impact: CRITICAL (build/test 성공만으로 visual parity 완료를 선언하는 일을 막음)**

Build/test 통과는 필요하지만 visual parity의 완료 조건은 아닙니다.
실제 브라우저에서 구현 화면 screenshot을 확인하고,
Figma screenshot과 비교해 mismatch가 남으면 가능한 범위에서 수정 반복합니다.
브라우저 검증을 못 하면 완료가 아니라 미검증 상태로 보고합니다.

**Incorrect (빌드 성공만으로 완료):**

```md
npm run build 통과했습니다. 완료입니다.
```

**Correct (브라우저 screenshot 비교까지 보고):**

```md
npm run build 통과.
브라우저 screenshot 확인 완료.
Figma 대비 spacing과 button label mismatch 수정 완료.
남은 mismatch: chart 내부 tick label은 third-party canvas 렌더링이라 별도 후속 필요.
```
