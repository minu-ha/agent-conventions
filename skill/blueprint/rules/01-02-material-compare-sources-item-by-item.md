---
title: Compare Sources Item by Item
titleKo: 재료는 항목별로 대조합니다
impact: CRITICAL
impactDescription: 한쪽을 통째로 채택하다 다른 쪽에만 있는 변화와 어긋남을 놓치지 않게 합니다
appliesWhen:
  - 전달문, 기획 데모, Figma가 둘 이상 있는 화면 문서나 변경 문서를 쓸 때
  - 새 판의 데모나 Figma를 옛 판과 견줄 때
tags: material, compare, demo, figma
---

## Compare Sources Item by Item

**Impact: CRITICAL (한쪽을 통째로 채택하다 다른 쪽에만 있는 변화와 어긋남을 놓치지 않게 합니다)**

재료가 둘 이상이면 항목마다 한 줄씩 표로 대조합니다. "데모 기준으로 전부"처럼 한쪽을 통째로 채택하지 않습니다.
표의 칸은 항목, 데모, Figma, 지금 코드, 처리입니다. 처리는 정답표의 종류로 정합니다.

| 대조 결과 | 처리 |
| --- | --- |
| 둘이 같음 | 확정 |
| 기능, 데이터가 다름 | 데모로 확정 |
| 모양, 배치, 표기, 문구, 색이 다름 | Figma로 확정 |
| Figma에만 그려진 조작 | Figma를 따름. 데모는 조작을 지우는 근거가 아닙니다 |
| 애매하거나 한쪽에만 있음 | 질문으로 남김 |

전달문에 없고 데모에서만 바뀐 것은 "전달 밖 변화" 표로 따로 모읍니다. 그 표의 줄은 전부 질문 후보입니다.
데모는 브라우저로 열어 목록 화면의 머리, 툴팁, 조건, 행을 직접 잽니다. Figma는 구역 프레임 캡처로 봅니다.
옛 판으로 닫은 질문은 새 판이 오면 같은 표로 다시 대조합니다.

**Incorrect 1 (한쪽 재료를 통째로 채택해 Figma에만 있는 조작과 데모에만 있는 변화를 놓칩니다):**

<<< ../examples/material-compare-sources-item-by-item/01-incorrect.markdown

**Correct 1 (항목별 대조표와 전달 밖 변화 표가 처리를 한 줄씩 정합니다):**

<<< ../examples/material-compare-sources-item-by-item/02-correct.markdown
