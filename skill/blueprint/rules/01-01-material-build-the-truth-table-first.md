---
title: Build the Truth Table First
titleKo: 재료 정답표를 먼저 만듭니다
impact: CRITICAL
impactDescription: 재료가 어긋날 때마다 무엇을 따를지 다시 묻지 않고 한 표로 판정합니다
appliesWhen:
  - 새 프로젝트의 overview 문서를 쓸 때
  - Figma, 기획 데모, API spec이 새 판으로 왔을 때
tags: material, truth, overview
---

## Build the Truth Table First

**Impact: CRITICAL (재료가 어긋날 때마다 무엇을 따를지 다시 묻지 않고 한 표로 판정합니다)**

설계 문서를 쓰기 전에 재료마다 무엇의 정답인지 `overview.md`에 표로 정합니다.
재료는 보통 다섯이고, 프로젝트가 가진 것만 적습니다.

| 재료 | 정답인 것 | 문서에서 쓰는 자리 |
| --- | --- | --- |
| Figma | 모양, 배치, 문구, 색, 표기 | 화면 절, 캡처 |
| 기획 데모 | 기능, 데이터, 계산, 선택 공유 | 화면 절의 흐름과 상태 |
| API spec | endpoint, 응답 모양 | Data and API 절 |
| 지금 코드와 옛 저장소 | 가져다 쓸 것, 되살릴 것 | Reuse 절 |
| 운영 캡처 | 실제 값, 실제 응답 | 그 값을 쓰는 절 |

전달문은 근거일 뿐 혼자서 정답이 되지 않습니다. 전달문이 가리키는 재료를 찾아 그쪽으로 확정합니다.
사용자가 앞서 직접 정한 것은 새 재료와 달라도 표가 뒤집지 않습니다. 다시 정할 것으로 올립니다.
Figma와 데모가 같은 항목을 다르게 말하면 이 표의 종류로 가릅니다. 가르기 어려우면 질문으로 남깁니다.

판이 바뀌면 표의 판 번호와 날짜를 고치고, 옛 판으로 닫은 질문을 다시 대조합니다.

**Incorrect 1 (정답표 없이 Figma 샘플로 기능과 데이터까지 확정합니다):**

<<< ../examples/material-build-the-truth-table-first/01-incorrect.markdown

**Correct 1 (overview의 정답표가 재료마다 정답인 것과 쓰는 자리를 정합니다):**

<<< ../examples/material-build-the-truth-table-first/02-correct.markdown
