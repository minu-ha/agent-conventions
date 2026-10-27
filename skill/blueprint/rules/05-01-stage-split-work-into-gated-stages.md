---
title: Split Work into Gated Stages
titleKo: 일은 관문 있는 단계로 나눕니다
impact: HIGH
impactDescription: 어느 단계를 지금 시작할 수 있고 무엇이 막는지 한 표로 보이게 합니다
appliesWhen:
  - 화면 문서의 Remaining 절을 쓸 때
  - 구현 순서를 정하거나 바꿀 때
tags: stage, gate, remaining
---

## Split Work into Gated Stages

**Impact: HIGH (어느 단계를 지금 시작할 수 있고 무엇이 막는지 한 표로 보이게 합니다)**

구현은 단계 표로 나눕니다. 단계마다 막는 질문과 끝났음을 보이는 확인 명령을 하나씩 둡니다.

| 단계 | 내용 |
| --- | --- |
| 0 준비 | 부품 승격, 새 ui 부품, 프로브 |
| 1부터 | 화면 구역 하나씩. 지금 spec 위 mock으로 |
| 연동 | BE가 주는 대로 spec 재생성, 깨진 곳 수정, 칸 켜기 |
| 검증 | 테스트, 캡처 대조, 사용자 확인 |

표의 칸은 `Stage`, `Work`, `Blocked by`, `Check`, `Status`입니다.

| 칸 | 쓰는 법 |
| --- | --- |
| `Blocked by` | 그 단계의 코드가 답에 따라 달라지는 질문 링크만. 여러 단계를 막으면 가장 이른 단계에 |
| `Check` | 끝났음을 보이는 명령 하나 |
| `Status` | `Ready`, `Blocked`, `Waiting on BE`, `Done` 날짜 |

BE 대기는 막는 것으로 세지 않고 연동 단계에 둡니다. 단계 표 아래에 열린 질문 수와 `questions.md` 링크를 둡니다.

**Incorrect 1 (관문 없는 할 일 목록이라 무엇부터 시작할 수 있는지 알 수 없습니다):**

<<< ../examples/stage-split-work-into-gated-stages/01-incorrect.markdown

**Correct 1 (단계마다 막는 질문과 확인 명령을 둔 표입니다):**

<<< ../examples/stage-split-work-into-gated-stages/02-correct.markdown
