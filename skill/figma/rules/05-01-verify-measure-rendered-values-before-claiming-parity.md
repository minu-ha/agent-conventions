---
title: Measure Rendered Values Before Claiming Parity
titleKo: 일치를 주장하기 전에 렌더 값을 실측합니다
impact: HIGH
impactDescription: 눈으로 대조해서는 놓치는 간격, 색, 빠진 상태를 수치로 확인하고 보고합니다
appliesWhen:
  - Figma 기준 구현이나 수정을 마무리하거나 완료로 보고할 때
requiredOnCompletion: true
tags: verify, parity, measurement
---

## Measure Rendered Values Before Claiming Parity

**Impact: HIGH (눈으로 대조해서는 놓치는 간격, 색, 빠진 상태를 수치로 확인하고 보고합니다)**

스크린샷을 눈으로 대조하면 1px 간격, 비슷한 회색, 빠진 상태를 놓칩니다.
실제 라우트에서 렌더 값을 읽어 스펙 행과 대조하고, 수치로 확인한 행만 일치로 보고합니다.

1. 스펙 행을 만듭니다.
   요소, 속성, 스펙 토큰과 값을 한 행에 둡니다.
   에셋은 로컬 파일이 비어 있지 않은지, 렌더 폭과 높이가 Figma 비율과 맞는지도 행으로 둡니다.
2. 실제 라우트를 열고 `getComputedStyle`, `getBoundingClientRect`로 값을 읽습니다.
3. 행마다 판정을 붙입니다.
4. 고칠 수 있는 차이를 고치고 다시 잽니다.
   세 번 돌면 멈추고 남은 행은 그대로 보고합니다.

| 판정 | 뜻 |
| --- | --- |
| `PASS` | 렌더 값이 스펙 토큰의 값과 같습니다 |
| `DRIFT` | 토큰은 맞게 썼지만 토큰 값이 Figma 값과 다릅니다 |
| `HARDCODED` | 토큰 대신 값을 직접 썼습니다 |
| `VARIANT` | 상태나 변형이 달라 비교 대상이 아닙니다. `DRIFT`보다 먼저 판정합니다 |
| `MISSING` | 요소나 상태가 화면에 없습니다 |
| `UNMEASURED` | 잴 수단이 없어 재지 못했습니다. 이 행은 일치로 보고하지 않습니다 |

값은 브라우저 자동화 도구의 페이지 평가로 읽습니다.
도구가 없으면 행을 `UNMEASURED`로 두고, 사람이 잴 수 있게 요소와 속성을 보고에 남깁니다.
브라우저 스크린샷을 Figma 스크린샷 옆에 두고 배치와 누락을 보되, 이 대조가 수치 판정을 대신하지는 않습니다.
판정 어휘는 jeltehomminga/figma-design-skills의 `design-fidelity-verify`(MIT)에서 가져왔습니다.

**Incorrect 1 (눈으로 대조한 결과를 일치로 보고합니다):**

<<< ../examples/verify-measure-rendered-values-before-claiming-parity/01-incorrect.txt

**Correct 1 (렌더 값을 행마다 재고 판정을 붙입니다):**

<<< ../examples/verify-measure-rendered-values-before-claiming-parity/02-correct.txt
