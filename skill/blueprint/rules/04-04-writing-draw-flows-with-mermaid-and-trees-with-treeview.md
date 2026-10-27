---
title: Draw Flows with Mermaid and Trees with treeView
titleKo: 흐름은 Mermaid, 구조는 treeView로 그립니다
impact: HIGH
impactDescription: 한글이 든 ASCII 그림이 줄 어긋나는 일을 없애고 그림 종류를 뜻에 맞춥니다
appliesWhen:
  - 설계 문서에서 흐름, 구조, 순서를 그림으로 그릴 때
  - 설계 문서에 ASCII 상자나 손 목업을 넣으려 할 때
tags: writing, mermaid, treeview, diagram
---

## Draw Flows with Mermaid and Trees with treeView

**Impact: HIGH (한글이 든 ASCII 그림이 줄 어긋나는 일을 없애고 그림 종류를 뜻에 맞춥니다)**

그림은 뜻에 맞는 Mermaid 종류로 그리고, 칸이 필요한 것은 표로 씁니다.

| 그리는 것 | 종류 |
| --- | --- |
| 판단 사슬, 순서 | `flowchart LR`. 예 사슬을 윗줄로 |
| 요청 왕복 | `sequenceDiagram` |
| 상태 전이 | `stateDiagram-v2` |
| 폴더, 컴포넌트 소유 | `treeView-beta`. 주석은 줄 끝 |
| 비교, 행렬, 열 폭 | 표 |

라벨은 개조식이고 괄호를 피하며 긴 라벨은 `<br>`로 나눕니다. 선 라벨은 한 낱말입니다.
가로가 넓어지면 `LR`을 `TD`로 바꾸거나 그림을 둘로 나눕니다. 되돌아가는 선은 상자를 합쳐 없앱니다.
한글이 든 ASCII 상자와 표는 쓰지 않습니다. 고정폭 글꼴에서 한글 폭이 정확히 두 칸이 아니라 줄이 어긋납니다.

**Incorrect 1 (한글이 든 ASCII 상자로 흐름과 구조를 그립니다):**

<<< ../examples/writing-draw-flows-with-mermaid-and-trees-with-treeview/01-incorrect.markdown

**Correct 1 (흐름은 flowchart, 구조는 treeView로 그립니다):**

<<< ../examples/writing-draw-flows-with-mermaid-and-trees-with-treeview/02-correct.markdown
