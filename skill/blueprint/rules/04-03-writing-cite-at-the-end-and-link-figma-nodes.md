---
title: Cite at the End and Link Figma Nodes
titleKo: 출처는 끝에, Figma 노드는 링크로 둡니다
impact: HIGH
impactDescription: 사람이 못 알아보는 노드 번호와 파일 위치가 본문을 끊지 않게 하고 출처는 바로 열게 합니다
appliesWhen:
  - 설계 문서에 출처, Figma 노드, 파일 위치를 적을 때
  - 본문에 노드 id나 파일 경로가 글자로 드러날 때
tags: writing, citation, figma
---

## Cite at the End and Link Figma Nodes

**Impact: HIGH (사람이 못 알아보는 노드 번호와 파일 위치가 본문을 끊지 않게 하고 출처는 바로 열게 합니다)**

출처는 줄 끝에 작게 둡니다. 본문 가운데에 파일 경로나 노드 번호를 쓰지 않습니다.

| 출처 | 쓰는 법 |
| --- | --- |
| 파일 위치 | 코드 글꼴 `pg-orders.tsx:46` |
| Figma 노드 | 링크 글자는 `Figma`나 구역 이름, 주소에 `node-id`. 한 줄에 링크 하나 |
| 캡처 | `img/<화면>/`의 상대 경로 링크 |
| 데모, spec | 판과 날짜, 커밋 `e2a8cf31` |

노드 id는 사람이 알아볼 수 없으므로 글자로 드러내지 않습니다. 링크 주소에만 둡니다.
여러 노드를 한 줄에 적지 않습니다. 줄을 나누거나 부모 프레임 하나로 가리킵니다.

**Incorrect 1 (노드 번호와 경로가 본문 가운데 글자로 드러나 읽기를 끊습니다):**

<<< ../examples/writing-cite-at-the-end-and-link-figma-nodes/01-incorrect.markdown

**Correct 1 (출처는 줄 끝에 코드와 링크로, 노드 id는 주소에만 둡니다):**

<<< ../examples/writing-cite-at-the-end-and-link-figma-nodes/02-correct.markdown
