---
title: Read Figma as UX Not Pixels
titleKo: Figma는 픽셀이 아니라 UX로 읽습니다
impact: CRITICAL
impactDescription: UX 안의 임의 치수를 문서에 옮겨 구현이 프로젝트 기본값과 어긋나지 않게 합니다
appliesWhen:
  - Figma 파일이나 노드를 설계 문서의 재료로 읽을 때
  - Figma의 폭, 간격, 줄 높이를 문서에 적으려 할 때
requiresSelected: figma/read-start-with-screenshot-and-metadata
tags: material, figma, ux, capture
---

## Read Figma as UX Not Pixels

**Impact: CRITICAL (UX 안의 임의 치수를 문서에 옮겨 구현이 프로젝트 기본값과 어긋나지 않게 합니다)**

기획이 그린 Figma는 UX 안입니다. 폭 급, 정렬, 문구, 순서, 아이콘만 읽고 안쪽 치수는 프로젝트 기본값에 맡깁니다.

| 읽는 것 | 안 읽는 것 |
| --- | --- |
| 열 폭의 급 (100px 단위), 정렬 방향 | 안쪽 패딩, 간격, 줄 높이 |
| 문구, 열 순서, 조작 아이콘 | 글꼴 크기, 모서리 반경 |
| 메모, 변경 이력, 댓글의 요지 | 레이어 이름 |

호출 순서와 대상 노드는 `figma/read-start-with-screenshot-and-metadata`가 정합니다.
문서에 남기는 것은 읽은 구역 프레임 목록, 구역 캡처, 메모와 댓글의 요지입니다.
수천 노드짜리 래퍼는 메타데이터를 파일로 받아 스크립트로만 파싱하고, 화면 프레임 아래 구역 프레임만 캡처합니다.
댓글은 MCP에 없으므로 REST `GET /v1/files/{key}/comments`로 받고, 토큰은 git 밖에 둡니다.

픽셀 차이는 어긋남으로 보고하지 않습니다. 폭 급, 정렬, 문구, 순서가 다를 때만 어긋남입니다.

**Incorrect 1 (Figma 프레임의 치수를 그대로 문서의 계약으로 적습니다):**

<<< ../examples/material-read-figma-as-ux-not-pixels/01-incorrect.markdown

**Correct 1 (폭 급과 정렬, 문구만 적고 치수는 프로젝트 부품 기본값으로 둡니다):**

<<< ../examples/material-read-figma-as-ux-not-pixels/02-correct.markdown
