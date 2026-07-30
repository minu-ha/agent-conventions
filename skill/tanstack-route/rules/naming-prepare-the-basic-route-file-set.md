---
title: Prepare the Basic Route File Set
titleKo: 기본 route 파일 세트를 갖추기
impact: MEDIUM-HIGH
impactDescription: 중첩 route 가 처음부터 스타일·셸 코드·순수 헬퍼를 둘 예측 가능한 자리를 갖게 함
tags: file-set, route-assets, naming
---

## Prepare the Basic Route File Set

**Impact: MEDIUM-HIGH (중첩 route 가 처음부터 스타일·셸 코드·순수 헬퍼를 둘 예측 가능한 자리를 갖게 함)**

이 프로젝트의 route file set은 `feature.css`, `feature.ts`, `feature.layout.tsx`,
`feature.index.tsx` 4개를 기본 세트로 봅니다.
`*.layout.tsx`는 눈에 띄는 shell UI가 아직 없더라도 route tunnel과 향후 layout 책임을 받을 경계로 미리 두고,
`*.ts`는 route support code가 자라날 기본 자리로 둡니다.
이렇게 해야 라우트가 커져도 스타일, 셸, 화면, 순수 로직의 자리가 예측 가능하게 유지됩니다.

**Incorrect (4-file set 없이 화면 파일만 먼저 만들어 책임 경계가 사라짐):**

```txt
(settings)/
  settings.index.tsx
```

**Correct (기본 4-file route 세트를 먼저 마련):**

```txt
(settings)/
  settings.css
  settings.ts
  settings.layout.tsx
  settings.index.tsx
```
